/**
 * Ruta de búsqueda unificada (coordenadas + nombres + texto libre)
 */

import express, { Request, Response } from 'express';
import axios from 'axios';
import { z } from 'zod';
import { parseCoordinates } from '../utils/coords';
import { LRUCache, generateCacheKey } from '../utils/cache';
import { findRegionByCoordinates, getRegionContext } from '../utils/regions';
import layersData from '../data/layers.json';

const router = express.Router();

// Cache para resolución de nombres
const searchCache = new LRUCache<any>(128, 600000); // 10 min

const SearchSchema = z.object({
  q: z.string().min(1).max(500),
});

interface SearchResult {
  type: 'coords' | 'object' | 'keywords' | 'solar_system';
  ra: number;
  dec: number;
  fov: number; // Field of view recomendado (grados)
  name?: string;
  suggestions: Array<{
    id: string;
    survey: string;
    service: string;
    band: string;
    wavelength_um: number;
  }>;
  note?: string;
}

/**
 * GET /api/search?q=<query>
 * 
 * Búsqueda unificada que soporta:
 * 1. Coordenadas (decimales, HMS/DMS)
 * 2. Nombres de objetos (resueltos vía IRSA SCS/TAP)
 * 3. Texto libre (keywords mapeadas a surveys)
 * 
 * Ejemplos:
 * /api/search?q=266.41683 -29.00781
 * /api/search?q=17:45:40 -28:56:10
 * /api/search?q=Cygnus X
 * /api/search?q=NGC 7000
 * /api/search?q=polvo interestelar brillante
 * /api/search?q=regiones HII
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const { q } = SearchSchema.parse(req.query);
    
    const cacheKey = generateCacheKey('search', { q });
    const cached = searchCache.get(cacheKey);
    
    if (cached) {
      console.log(`[CACHE HIT] Search: ${q}`);
      return res.json(cached);
    }

    console.log(`[SEARCH] Query: "${q}"`);

    // 1. Intentar parsear como coordenadas
    const coords = parseCoordinates(q);
    if (coords) {
      const result: SearchResult = {
        type: 'coords',
        ra: coords.ra,
        dec: coords.dec,
        fov: 4, // FOV por defecto
        suggestions: getDefaultSuggestions(),
        note: formatCoordinates(coords.ra, coords.dec),
      };
      
      searchCache.set(cacheKey, result);
      return res.json(result);
    }

    // 2. Intentar resolver como nombre de objeto
    const objectResult = await resolveObjectName(q);
    if (objectResult) {
      searchCache.set(cacheKey, objectResult);
      return res.json(objectResult);
    }

    // 3. Buscar por keywords (texto libre)
    const keywordResult = searchByKeywords(q);
    if (keywordResult) {
      searchCache.set(cacheKey, keywordResult);
      return res.json(keywordResult);
    }

    // Si no se pudo resolver, error
    res.status(404).json({
      error: 'No se pudo resolver la búsqueda',
      query: q,
      suggestions: [
        'Usa coordenadas: "266.41683 -29.00781" o "17:45:40 -28:56:10"',
        'Usa nombres: "Cygnus X", "NGC 7000", "M42"',
        'Usa keywords: "polvo IR", "regiones HII", "centro galáctico"',
      ],
    });

  } catch (error) {
    console.error('[SEARCH ERROR]', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Parámetros inválidos',
        details: error.errors,
      });
    }

    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// ============================================================================
// Helpers
// ============================================================================

/**
 * Resuelve nombre de objeto usando SIMBAD (CDS)
 * SIMBAD es la base de datos de referencia para objetos astronómicos
 */
async function resolveObjectName(name: string): Promise<SearchResult | null> {
  try {
    console.log(`[SIMBAD] Resolviendo: ${name}`);
    
    // Usar el servicio sesame de CDS que consulta SIMBAD, NED y VizieR
    const sesameUrl = `https://cdsweb.u-strasbg.fr/cgi-bin/nph-sesame/-oI/A?${encodeURIComponent(name)}`;
    
    const response = await axios.get(sesameUrl, {
      timeout: 15000,
      headers: {
        'User-Agent': 'MilkyWayExplorer/1.0',
      },
    });

    const data = response.data;
    
    // Parsear la respuesta (formato texto plano)
    // Buscar líneas con %J <RA> <DEC> (coordenadas J2000)
    const coordMatch = data.match(/%J\s+([\d.]+)\s+([-+]?[\d.]+)/);
    
    if (!coordMatch) {
      console.log('[SIMBAD] No se encontraron coordenadas');
      return null;
    }

    const ra = parseFloat(coordMatch[1]);
    const dec = parseFloat(coordMatch[2]);

    if (isNaN(ra) || isNaN(dec)) {
      console.log('[SIMBAD] Coordenadas inválidas');
      return null;
    }

    // Extraer el tipo de objeto si está disponible
    const typeMatch = data.match(/%C\.0\s+([^\n]+)/);
    const objectType = typeMatch ? typeMatch[1].trim() : 'Unknown';

    console.log(`[SIMBAD] ✓ Resuelto: ${name} -> RA=${ra}, DEC=${dec}, Type=${objectType}`);

    // Determinar FOV basado en el tipo de objeto
    let fov = 2; // Por defecto 2 grados
    const typeLower = objectType.toLowerCase();
    
    if (typeLower.includes('nebula') || typeLower.includes('neb')) {
      fov = 3;
    } else if (typeLower.includes('galaxy') || typeLower.includes('gal')) {
      fov = 1;
    } else if (typeLower.includes('cluster') || typeLower.includes('cl')) {
      fov = 2;
    } else if (typeLower.includes('star')) {
      fov = 0.5;
    }

    return {
      type: 'object',
      ra,
      dec,
      fov,
      name,
      suggestions: getSuggestionsForObjectType(objectType),
      note: `${name} (${objectType})`,
    };

  } catch (error: any) {
    console.error('[SIMBAD ERROR]', error.message);
    return null;
  }
}

/**
 * Obtiene sugerencias de surveys basadas en el tipo de objeto
 */
function getSuggestionsForObjectType(objectType: string): any[] {
  const typeLower = objectType.toLowerCase();
  
  // Nebulosas y regiones HII -> infrarrojo y UV
  if (typeLower.includes('nebula') || typeLower.includes('neb') || typeLower.includes('hii')) {
    return [
      { id: 'wise_w4', survey: 'WISE W4 (22µm)', service: 'irsa', band: 'IR', wavelength_um: 22 },
      { id: 'wise_w3', survey: 'WISE W3 (12µm)', service: 'irsa', band: 'IR', wavelength_um: 12 },
      { id: 'galex_fuv', survey: 'GALEX FUV (0.15µm)', service: 'skyview', band: 'UV', wavelength_um: 0.15 },
    ];
  }
  
  // Galaxias -> óptico + infrarrojo lejano
  if (typeLower.includes('galaxy') || typeLower.includes('gal')) {
    return [
      { id: 'dss2_red', survey: 'DSS2 Red', service: 'skyview', band: 'Optical', wavelength_um: 0.65 },
      { id: 'wise_w1', survey: 'WISE W1 (3.4µm)', service: 'irsa', band: 'IR', wavelength_um: 3.4 },
      { id: 'galex_nuv', survey: 'GALEX NUV (0.23µm)', service: 'skyview', band: 'UV', wavelength_um: 0.23 },
    ];
  }
  
  // Estrellas -> cercano infrarrojo + óptico
  if (typeLower.includes('star')) {
    return [
      { id: '2mass_k', survey: '2MASS Ks (2.2µm)', service: 'irsa', band: 'NIR', wavelength_um: 2.2 },
      { id: 'dss2_red', survey: 'DSS2 Red', service: 'skyview', band: 'Optical', wavelength_um: 0.65 },
      { id: '2mass_j', survey: '2MASS J (1.2µm)', service: 'irsa', band: 'NIR', wavelength_um: 1.2 },
    ];
  }
  
  // Cúmulos -> óptico + infrarrojo cercano
  if (typeLower.includes('cluster') || typeLower.includes('cl')) {
    return [
      { id: '2mass_k', survey: '2MASS Ks (2.2µm)', service: 'irsa', band: 'NIR', wavelength_um: 2.2 },
      { id: 'dss2_red', survey: 'DSS2 Red', service: 'skyview', band: 'Optical', wavelength_um: 0.65 },
      { id: 'wise_w1', survey: 'WISE W1 (3.4µm)', service: 'irsa', band: 'IR', wavelength_um: 3.4 },
    ];
  }
  
  // Por defecto: surveys generales
  return getDefaultSuggestions();
}

/**
 * Busca por keywords en el texto libre
 */
function searchByKeywords(text: string): SearchResult | null {
  const lower = text.toLowerCase().trim();

  // ============================================================================
  // SISTEMA SOLAR
  // ============================================================================
  
  const solarSystemMap: Record<string, { ra: number; dec: number; fov: number; note: string; surveys: string[] }> = {
    // Vista general del Sistema Solar
    'sistema solar': { 
      ra: 83.818662, // Nebulosa de Orión - región de formación planetaria
      dec: -5.389679, 
      fov: 4,
      note: 'Sistema Solar - Te mostramos la Nebulosa de Orión (M42), donde se están formando nuevos sistemas planetarios ahora mismo. Así se veía la región donde nació nuestro Sistema Solar hace 4,600 millones de años.',
      surveys: ['wise_w4', 'wise_w3', 'dss2_red']
    },
    'solar system': { 
      ra: 83.818662,
      dec: -5.389679, 
      fov: 4,
      note: 'Solar System - Showing you the Orion Nebula (M42), where new planetary systems are forming right now. This is how the region where our Solar System was born looked 4.6 billion years ago.',
      surveys: ['wise_w4', 'wise_w3', 'dss2_red']
    },
    
    // El Sol
    'sol': { 
      ra: 266.41683, // Centro Galáctico
      dec: -29.00781, 
      fov: 6,
      note: 'El Sol - Nuestro Sol es una estrella tipo G2V a 26,000 años luz del Centro Galáctico. Te mostramos Sagitario A*, el agujero negro supermasivo de 4 millones de masas solares en el corazón de la Vía Láctea.',
      surveys: ['wise_w3', '2mass_k', 'dss2_red']
    },
    'sun': { 
      ra: 266.41683,
      dec: -29.00781, 
      fov: 6,
      note: 'The Sun - Our Sun is a G2V star 26,000 light-years from the Galactic Center. Showing you Sagittarius A*, the 4-million-solar-mass supermassive black hole at the heart of the Milky Way.',
      surveys: ['wise_w3', '2mass_k', 'dss2_red']
    },
    
    // La Tierra
    'tierra': { 
      ra: 83.818662, // M42
      dec: -5.389679, 
      fov: 3,
      note: 'La Tierra - Nuestro hogar en el cosmos. Te mostramos M42, donde se forman nuevos planetas. Así nació la Tierra hace 4,600 millones de años.',
      surveys: ['wise_w4', 'wise_w3', 'galex_fuv']
    },
    'earth': { 
      ra: 83.818662,
      dec: -5.389679, 
      fov: 3,
      note: 'Earth - Our home in the cosmos. Showing you M42, where new planets are forming. This is how Earth was born 4.6 billion years ago.',
      surveys: ['wise_w4', 'wise_w3', 'galex_fuv']
    },
    
    // La Luna
    'luna': { 
      ra: 56.869089, // Pleiades
      dec: 24.105313, 
      fov: 2,
      note: 'La Luna - Formada hace 4,500 millones de años por un impacto masivo. Te mostramos las Pléyades (M45), un cúmulo estelar joven donde las estrellas nacieron juntas.',
      surveys: ['2mass_k', 'dss2_red', 'wise_w1']
    },
    'moon': { 
      ra: 56.869089,
      dec: 24.105313, 
      fov: 2,
      note: 'The Moon - Formed 4.5 billion years ago by a massive impact. Showing you the Pleiades (M45), a young star cluster where stars were born together.',
      surveys: ['2mass_k', 'dss2_red', 'wise_w1']
    },
  };

  if (solarSystemMap[lower]) {
    const obj = solarSystemMap[lower];
    return {
      type: 'solar_system',
      ra: obj.ra,
      dec: obj.dec,
      fov: obj.fov,
      suggestions: obj.surveys.map(id => {
        const survey = (layersData.surveys as any[]).find(s => s.id === id);
        return survey ? {
          id: survey.id,
          survey: survey.survey,
          service: survey.service,
          band: survey.band,
          wavelength_um: survey.wavelength_um,
        } : null;
      }).filter((s): s is NonNullable<typeof s> => s !== null),
      note: obj.note,
    };
  }

  // ============================================================================
  // REGIONES DE LA VÍA LÁCTEA (keywords)
  // ============================================================================
  // Mapeo de keywords a coordenadas conocidas + surveys
  const keywordMap: Record<string, { ra: number; dec: number; fov: number; surveys: string[]; note: string }> = {
    'centro galáctico': {
      ra: 266.41683,
      dec: -29.00781,
      fov: 6,
      surveys: ['wise_w3', '2mass_k', 'dss2_red'],
      note: 'Centro de la Vía Láctea (Sgr A*)',
    },
    'cygnus x': {
      ra: 308.5,
      dec: 41.0,
      fov: 5,
      surveys: ['wise_w4', 'galex_fuv', 'nvss'],
      note: 'Región de formación estelar masiva',
    },
    'orión': {
      ra: 83.82208,
      dec: -5.39111,
      fov: 1.5,
      surveys: ['wise_w4', 'dss2_red', 'galex_nuv'],
      note: 'Nebulosa de Orión (M42)',
    },
    'polvo': {
      ra: 266.41683,
      dec: -29.00781,
      fov: 4,
      surveys: ['wise_w3', 'wise_w4'],
      note: 'Sugerencias para visualizar polvo interestelar',
    },
    'regiones hii': {
      ra: 308.5,
      dec: 41.0,
      fov: 5,
      surveys: ['galex_fuv', 'dss2_red', 'wise_w3'],
      note: 'Regiones de formación estelar',
    },
  };

  // Buscar matches
  for (const [keyword, data] of Object.entries(keywordMap)) {
    if (lower.includes(keyword)) {
      return {
        type: 'keywords',
        ra: data.ra,
        dec: data.dec,
        fov: data.fov,
        suggestions: data.surveys.map(id => {
          const survey = layersData.surveys.find(s => s.id === id);
          return survey ? {
            id: survey.id,
            survey: survey.name,
            service: survey.service,
            band: survey.band,
            wavelength_um: survey.wavelength_um,
          } : null;
        }).filter(Boolean) as any[],
        note: data.note,
      };
    }
  }

  return null;
}

/**
 * Suggestions por defecto (surveys más populares)
 */
function getDefaultSuggestions() {
  const defaultIds = ['wise_w3', '2mass_k', 'dss2_red', 'galex_fuv'];
  
  return defaultIds.map(id => {
    const survey = layersData.surveys.find(s => s.id === id);
    return survey ? {
      id: survey.id,
      survey: survey.name,
      service: survey.service,
      band: survey.band,
      wavelength_um: survey.wavelength_um,
    } : null;
  }).filter(Boolean) as any[];
}

/**
 * Formatea coordenadas en formato legible
 */
function formatCoordinates(ra: number, dec: number): string {
  const raHours = ra / 15;
  const h = Math.floor(raHours);
  const m = Math.floor((raHours - h) * 60);
  const s = ((raHours - h - m / 60) * 3600).toFixed(1);

  const decSign = dec >= 0 ? '+' : '-';
  const decAbs = Math.abs(dec);
  const d = Math.floor(decAbs);
  const dm = Math.floor((decAbs - d) * 60);
  const ds = ((decAbs - d - dm / 60) * 3600).toFixed(1);

  return `RA ${h}h ${m}m ${s}s, Dec ${decSign}${d}° ${dm}' ${ds}"`;
}

/**
 * Sanitiza string para ADQL (prevención básica de SQL injection)
 */
function sanitizeForSQL(input: string): string {
  return input.replace(/[';-]/g, '').trim();
}

/**
 * GET /api/search/nearby?ra=<ra>&dec=<dec>&radius=<arcmin>
 * 
 * Busca la región astronómica grande que contiene las coordenadas
 * En lugar de objetos individuales, retorna nombres de regiones (Orión, Centro Galáctico, etc.)
 */
router.get('/nearby', async (req: Request, res: Response) => {
  try {
    const ra = parseFloat(req.query.ra as string);
    const dec = parseFloat(req.query.dec as string);

    if (isNaN(ra) || isNaN(dec)) {
      return res.status(400).json({ error: 'Coordenadas inválidas' });
    }

    console.log(`[NEARBY] Buscando región para RA=${ra}, DEC=${dec}`);

    // Buscar la región astronómica que contiene estas coordenadas
    const region = findRegionByCoordinates(ra, dec);
    const context = getRegionContext(region);

    console.log(`[NEARBY] ✓ Región encontrada: ${region.name}`);

    return res.json({
      found: true,
      name: region.name,
      type: 'region',
      description: region.description,
      context: context,
      icon: region.icon,
      ra,
      dec,
    });

  } catch (error: any) {
    console.error('[NEARBY ERROR]', error.message);
    res.status(500).json({
      error: 'Error buscando región',
      found: false,
    });
  }
});

// Cleanup periódico
setInterval(() => {
  const removed = searchCache.cleanup();
  if (removed > 0) {
    console.log(`[CACHE CLEANUP] Removed ${removed} expired search entries`);
  }
}, 300000);

export default router;
