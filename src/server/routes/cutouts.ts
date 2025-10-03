/**
 * Rutas para recortes de imagen (cutouts) de IRSA y SkyView
 */

import express, { Request, Response } from 'express';
import axios, { AxiosError } from 'axios';
import { z } from 'zod';
import { LRUCache, generateCacheKey } from '../utils/cache';

const router = express.Router();

// Cache para cutouts (FITS/PNG son grandes, menos entradas)
const cutoutCache = new LRUCache<Buffer>(128, 900000); // 15 min TTL

// Validación de parámetros comunes
const BaseCutoutSchema = z.object({
  ra: z.coerce.number().min(0).max(360),
  dec: z.coerce.number().min(-90).max(90),
  size: z.coerce.number().min(0.01).max(10), // grados
});

// ============================================================================
// IRSA Image Cutouts
// ============================================================================

const IRSACutoutSchema = BaseCutoutSchema.extend({
  survey: z.enum(['wise_allsky', 'wise_3band', '2mass']).default('wise_allsky'),
  band: z.string().optional(), // Ej: '1' para WISE W1, 'j' para 2MASS J
  format: z.enum(['fits', 'png', 'jpeg']).default('fits'),
  pixels: z.coerce.number().min(64).max(2048).default(512),
});

/**
 * GET /api/cutout/irsa
 * 
 * Obtiene un recorte de imagen de IRSA
 * 
 * Parámetros:
 * - ra: Right Ascension (grados, 0-360)
 * - dec: Declination (grados, -90 a 90)
 * - size: Tamaño del recorte (grados, 0.01-10)
 * - survey: Dataset IRSA (wise_allsky, wise_3band, 2mass)
 * - band: Banda específica (1-4 para WISE, j/h/k para 2MASS)
 * - format: Formato de salida (fits, png, jpeg)
 * - pixels: Resolución (64-2048 píxeles)
 * 
 * Ejemplos:
 * /api/cutout/irsa?ra=83.82&dec=-5.39&size=0.5&survey=wise_allsky&band=3
 * /api/cutout/irsa?ra=266.41&dec=-29.00&size=2&survey=2mass&band=k&format=png
 */
router.get('/irsa', async (req: Request, res: Response) => {
  try {
    const params = IRSACutoutSchema.parse(req.query);
    
    // Generar clave de cache
    const cacheKey = generateCacheKey('irsa_cutout', params);
    const cached = cutoutCache.get(cacheKey);
    
    if (cached) {
      console.log(`[CACHE HIT] IRSA cutout: ${cacheKey}`);
      const contentType = params.format === 'fits' ? 'application/fits' : `image/${params.format}`;
      return res.type(contentType).send(cached);
    }

    // Construir URL de IRSA Image Server
    // Documentación: https://irsa.ipac.caltech.edu/docs/program_interface/imageserver.html
    const baseUrl = 'https://irsa.ipac.caltech.edu/cgi-bin/ImageCutout/nph-image';
    
    const irsaParams: Record<string, string> = {
      POS: `${params.ra},${params.dec}`,
      SIZE: params.size.toString(),
      DATASET: params.survey,
      FORMAT: params.format.toUpperCase(),
    };

    // Añadir banda si se especificó
    if (params.band) {
      irsaParams.BAND = params.band;
    }

    console.log(`[IRSA] Requesting cutout: ${JSON.stringify(irsaParams)}`);

    const response = await axios.get(baseUrl, {
      params: irsaParams,
      responseType: 'arraybuffer',
      timeout: parseInt(process.env.IRSA_TIMEOUT_MS || '30000'),
      headers: {
        'User-Agent': 'MilkyWayExplorer/1.0',
      },
    });

    const imageBuffer = Buffer.from(response.data);

    // Verificar que no sea un error HTML
    const contentType = response.headers['content-type'] || '';
    if (contentType.includes('text/html')) {
      throw new Error('IRSA devolvió HTML en lugar de imagen (posible error)');
    }

    // Guardar en cache
    cutoutCache.set(cacheKey, imageBuffer);

    res.type(params.format === 'fits' ? 'application/fits' : `image/${params.format}`)
      .set('Cache-Control', 'public, max-age=900') // 15 min
      .send(imageBuffer);

  } catch (error) {
    console.error('[IRSA ERROR]', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Parámetros inválidos',
        details: error.errors,
      });
    }

    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;
      return res.status(axiosError.response?.status || 500).json({
        error: 'Error al obtener cutout de IRSA',
        message: axiosError.message,
      });
    }

    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// ============================================================================
// SkyView Cutouts (NASA/GSFC)
// ============================================================================

const SkyViewCutoutSchema = BaseCutoutSchema.extend({
  survey: z.string().default('DSS2 Red'), // Nombre exacto del survey
  pixels: z.coerce.number().min(64).max(2048).default(512),
  format: z.enum(['FITS', 'PNG', 'JPEG']).default('FITS'),
  projection: z.enum(['Tan', 'Sin', 'Arc']).default('Tan'),
});

/**
 * GET /api/cutout/skyview
 * 
 * Obtiene un recorte de imagen de NASA SkyView
 * 
 * Parámetros:
 * - ra: Right Ascension (grados)
 * - dec: Declination (grados)
 * - size: Tamaño del recorte (grados)
 * - survey: Nombre del survey (ej: "DSS2 Red", "WISE 3.4", "2MASS-J")
 * - pixels: Resolución (64-2048)
 * - format: Formato de salida (FITS, PNG, JPEG)
 * - projection: Proyección (Tan, Sin, Arc)
 * 
 * Surveys disponibles: https://skyview.gsfc.nasa.gov/current/cgi/survey.pl
 * 
 * Ejemplos:
 * /api/cutout/skyview?ra=266.41&dec=-29.00&size=4&survey=DSS2 Red
 * /api/cutout/skyview?ra=83.82&dec=-5.39&size=1&survey=WISE 12&format=PNG
 * /api/cutout/skyview?ra=308.5&dec=41.0&size=5&survey=NVSS&pixels=1024
 */
router.get('/skyview', async (req: Request, res: Response) => {
  try {
    const params = SkyViewCutoutSchema.parse(req.query);
    
    const cacheKey = generateCacheKey('skyview_cutout', params);
    const cached = cutoutCache.get(cacheKey);
    
    if (cached) {
      console.log(`[CACHE HIT] SkyView cutout: ${cacheKey}`);
      const contentType = params.format === 'FITS' ? 'application/fits' : `image/${params.format.toLowerCase()}`;
      return res.type(contentType).send(cached);
    }

    // Construir URL de SkyView
    // Documentación: https://skyview.gsfc.nasa.gov/current/help/index.html
    const baseUrl = 'https://skyview.gsfc.nasa.gov/current/cgi/runquery.pl';
    
    const skyviewParams = {
      Position: `${params.ra},${params.dec}`,
      Survey: params.survey,
      Pixels: params.pixels.toString(),
      Size: params.size.toString(),
      Return: params.format,
      Projection: params.projection,
      Coordinates: 'J2000',
      Sampler: 'LI', // Linear interpolation
    };

    console.log(`[SKYVIEW] Requesting cutout: ${JSON.stringify(skyviewParams)}`);

    const response = await axios.get(baseUrl, {
      params: skyviewParams,
      responseType: 'arraybuffer',
      timeout: parseInt(process.env.SKYVIEW_TIMEOUT_MS || '30000'),
      headers: {
        'User-Agent': 'MilkyWayExplorer/1.0',
      },
    });

    const imageBuffer = Buffer.from(response.data);

    // Verificar que no sea error HTML
    const contentType = response.headers['content-type'] || '';
    if (contentType.includes('text/html')) {
      throw new Error('SkyView devolvió HTML en lugar de imagen');
    }

    cutoutCache.set(cacheKey, imageBuffer);

    res.type(params.format === 'FITS' ? 'application/fits' : `image/${params.format.toLowerCase()}`)
      .set('Cache-Control', 'public, max-age=900')
      .send(imageBuffer);

  } catch (error) {
    console.error('[SKYVIEW ERROR]', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Parámetros inválidos',
        details: error.errors,
      });
    }

    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;
      return res.status(axiosError.response?.status || 500).json({
        error: 'Error al obtener cutout de SkyView',
        message: axiosError.message,
      });
    }

    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Cleanup periódico del cache
setInterval(() => {
  const removed = cutoutCache.cleanup();
  if (removed > 0) {
    console.log(`[CACHE CLEANUP] Removed ${removed} expired cutout entries`);
  }
}, 300000); // cada 5 minutos

export default router;
