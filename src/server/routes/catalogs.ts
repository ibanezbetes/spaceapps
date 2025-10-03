/**
 * Rutas para catálogos astronómicos (SCS y TAP de IRSA)
 */

import express, { Request, Response } from 'express';
import axios, { AxiosError } from 'axios';
import { z } from 'zod';
import { LRUCache, generateCacheKey } from '../utils/cache';
import xml2js from 'xml2js';

const router = express.Router();

// Cache para queries de catálogos
const catalogCache = new LRUCache<any>(256, 600000); // 10 min TTL

// ============================================================================
// Simple Cone Search (SCS) - IRSA
// ============================================================================

const ConeSearchSchema = z.object({
  ra: z.coerce.number().min(0).max(360),
  dec: z.coerce.number().min(-90).max(90),
  radius: z.coerce.number().min(0.001).max(5), // grados (max ~300 arcmin)
  table: z.enum([
    'allwise_p3as_psd',  // AllWISE Point Source Catalog
    'fp_psc',            // 2MASS Point Source Catalog
    'neowiser_p1bs_psd', // NEOWISE-R Single Exposure
  ]).default('allwise_p3as_psd'),
  limit: z.coerce.number().min(1).max(5000).default(200),
});

/**
 * GET /api/catalogs/cone
 * 
 * Búsqueda por cono (Simple Cone Search) en catálogos IRSA
 * 
 * Parámetros:
 * - ra: Right Ascension centro (grados, 0-360)
 * - dec: Declination centro (grados, -90 a 90)
 * - radius: Radio de búsqueda (grados, 0.001-5)
 * - table: Tabla IRSA (allwise_p3as_psd, fp_psc, neowiser_p1bs_psd)
 * - limit: Máximo de resultados (1-5000, default 200)
 * 
 * Documentación SCS: https://irsa.ipac.caltech.edu/docs/program_interface/scs.html
 * 
 * Ejemplos:
 * /api/catalogs/cone?ra=83.82&dec=-5.39&radius=0.2&table=allwise_p3as_psd
 * /api/catalogs/cone?ra=266.41&dec=-29.00&radius=0.5&table=fp_psc&limit=500
 */
router.get('/cone', async (req: Request, res: Response) => {
  try {
    const params = ConeSearchSchema.parse(req.query);
    
    const cacheKey = generateCacheKey('cone_search', params);
    const cached = catalogCache.get(cacheKey);
    
    if (cached) {
      console.log(`[CACHE HIT] Cone search: ${cacheKey}`);
      return res.json(cached);
    }

    // URL base del SCS de IRSA
    const baseUrl = 'https://irsa.ipac.caltech.edu/cgi-bin/Gator/nph-query';
    
    const scsParams = {
      catalog: params.table,
      spatial: 'cone',
      objstr: `${params.ra} ${params.dec}`,
      radius: params.radius,
      radunits: 'deg',
      outfmt: '1', // VOTable
      selcols: getColumnsForTable(params.table),
      outrows: params.limit.toString(),
    };

    console.log(`[SCS] Querying ${params.table}: RA=${params.ra}, Dec=${params.dec}, r=${params.radius}°`);

    const response = await axios.get(baseUrl, {
      params: scsParams,
      timeout: parseInt(process.env.IRSA_TIMEOUT_MS || '30000'),
      headers: {
        'User-Agent': 'MilkyWayExplorer/1.0',
      },
    });

    // Parsear VOTable XML a JSON
    const parser = new xml2js.Parser({ explicitArray: false });
    const votable = await parser.parseStringPromise(response.data);

    const sources = parseVOTable(votable);

    const result = {
      sources,
      count: sources.length,
      table: params.table,
      query: {
        ra: params.ra,
        dec: params.dec,
        radius: params.radius,
      },
    };

    catalogCache.set(cacheKey, result);

    res.json(result);

  } catch (error) {
    console.error('[SCS ERROR]', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Parámetros inválidos',
        details: error.errors,
      });
    }

    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;
      return res.status(axiosError.response?.status || 500).json({
        error: 'Error al consultar catálogo IRSA',
        message: axiosError.message,
      });
    }

    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// ============================================================================
// TAP (Table Access Protocol) - IRSA
// ============================================================================

const TAPQuerySchema = z.object({
  adql: z.string().min(10).max(5000),
  format: z.enum(['votable', 'csv', 'tsv', 'json']).default('json'),
  maxrec: z.coerce.number().min(1).max(10000).default(1000),
});

/**
 * POST /api/catalogs/tap
 * 
 * Ejecuta query ADQL en el servicio TAP de IRSA
 * 
 * Body (JSON):
 * {
 *   "adql": "SELECT ra,dec,designation,w1mpro FROM allwise_p3as_psd WHERE ...",
 *   "format": "json",
 *   "maxrec": 1000
 * }
 * 
 * Documentación TAP: https://irsa.ipac.caltech.edu/docs/program_interface/tap.html
 * Tutorial ADQL: http://www.ivoa.net/documents/ADQL/
 * 
 * Ejemplo ADQL (búsqueda por cono):
 * ```sql
 * SELECT ra, dec, designation, w1mpro, w2mpro, w3mpro, w4mpro
 * FROM allwise_p3as_psd
 * WHERE CONTAINS(POINT('ICRS', ra, dec), CIRCLE('ICRS', 83.82, -5.39, 0.3)) = 1
 * FETCH FIRST 200 ROWS ONLY
 * ```
 */
router.post('/tap', async (req: Request, res: Response) => {
  try {
    const params = TAPQuerySchema.parse(req.body);
    
    const cacheKey = generateCacheKey('tap_query', params);
    const cached = catalogCache.get(cacheKey);
    
    if (cached) {
      console.log(`[CACHE HIT] TAP query: ${cacheKey.substring(0, 100)}...`);
      return res.json(cached);
    }

    // URL del TAP de IRSA
    const tapUrl = 'https://irsa.ipac.caltech.edu/TAP/sync';
    
    const formData = new URLSearchParams({
      REQUEST: 'doQuery',
      LANG: 'ADQL',
      QUERY: params.adql,
      FORMAT: params.format === 'json' ? 'votable' : params.format, // Convertir después
      MAXREC: params.maxrec.toString(),
    });

    console.log(`[TAP] Executing ADQL: ${params.adql.substring(0, 100)}...`);

    const response = await axios.post(tapUrl, formData.toString(), {
      timeout: parseInt(process.env.IRSA_TIMEOUT_MS || '30000'),
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'MilkyWayExplorer/1.0',
      },
    });

    let result: any;

    if (params.format === 'json') {
      // Parsear VOTable a JSON
      const parser = new xml2js.Parser({ explicitArray: false });
      const votable = await parser.parseStringPromise(response.data);
      const rows = parseVOTable(votable);
      
      result = {
        rows,
        count: rows.length,
        adql: params.adql,
      };
    } else {
      result = response.data;
    }

    catalogCache.set(cacheKey, result);

    if (params.format === 'json') {
      res.json(result);
    } else {
      const contentType = 
        params.format === 'csv' ? 'text/csv' :
        params.format === 'tsv' ? 'text/tab-separated-values' :
        'application/xml';
      res.type(contentType).send(result);
    }

  } catch (error) {
    console.error('[TAP ERROR]', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Parámetros inválidos',
        details: error.errors,
      });
    }

    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;
      return res.status(axiosError.response?.status || 500).json({
        error: 'Error al ejecutar query TAP',
        message: axiosError.message,
      });
    }

    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// ============================================================================
// Helpers
// ============================================================================

/**
 * Columnas relevantes por tabla
 */
function getColumnsForTable(table: string): string {
  const columns: Record<string, string> = {
    'allwise_p3as_psd': 'designation,ra,dec,w1mpro,w2mpro,w3mpro,w4mpro,ph_qual',
    'fp_psc': 'designation,ra,dec,j_m,h_m,k_m,ph_qual',
    'neowiser_p1bs_psd': 'designation,ra,dec,w1mpro_ep,w2mpro_ep,mjd',
  };
  
  return columns[table] || 'ra,dec,designation';
}

/**
 * Parsea VOTable XML a array de objetos
 */
function parseVOTable(votable: any): any[] {
  try {
    const resource = votable.VOTABLE?.RESOURCE;
    if (!resource) return [];

    const table = Array.isArray(resource) ? resource[0]?.TABLE : resource?.TABLE;
    if (!table) return [];

    const fields = Array.isArray(table.FIELD) ? table.FIELD : [table.FIELD];
    const data = table.DATA?.TABLEDATA?.TR;
    
    if (!data) return [];

    const rows = Array.isArray(data) ? data : [data];

    return rows.map((row: any) => {
      const cells = Array.isArray(row.TD) ? row.TD : [row.TD];
      const obj: Record<string, any> = {};
      
      fields.forEach((field: any, index: number) => {
        const name = field.$.name || field.$.ID;
        const value = cells[index];
        
        // Convertir a número si es numérico
        if (field.$.datatype === 'double' || field.$.datatype === 'float') {
          obj[name] = value ? parseFloat(value) : null;
        } else if (field.$.datatype === 'int' || field.$.datatype === 'long') {
          obj[name] = value ? parseInt(value, 10) : null;
        } else {
          obj[name] = value || null;
        }
      });
      
      return obj;
    });
  } catch (error) {
    console.error('[VOTable Parse Error]', error);
    return [];
  }
}

// Cleanup periódico
setInterval(() => {
  const removed = catalogCache.cleanup();
  if (removed > 0) {
    console.log(`[CACHE CLEANUP] Removed ${removed} expired catalog entries`);
  }
}, 300000); // cada 5 min

export default router;
