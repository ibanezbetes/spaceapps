/**
 * Mapeo de coordenadas a regiones astronómicas grandes
 * Usado para el pop-up de clic en el mapa
 */

export interface AstronomicalRegion {
  name: string;
  description: string;
  ra_min: number;
  ra_max: number;
  dec_min: number;
  dec_max: number;
  icon: string;
}

/**
 * Regiones astronómicas principales de la Vía Láctea
 * Ordenadas por prioridad (más específicas primero)
 */
export const ASTRONOMICAL_REGIONS: AstronomicalRegion[] = [
  // ========================================================================
  // CENTRO GALÁCTICO Y NÚCLEO
  // ========================================================================
  {
    name: 'Centro Galáctico',
    description: 'Núcleo de la Vía Láctea con Sagitario A*',
    ra_min: 265,
    ra_max: 268,
    dec_min: -30,
    dec_max: -28,
    icon: '',
  },

  // ========================================================================
  // REGIONES DE FORMACIÓN ESTELAR MASIVA
  // ========================================================================
  {
    name: 'Complejo de Orión',
    description: 'Gran región de formación estelar (M42, M43, Cabeza de Caballo)',
    ra_min: 78,
    ra_max: 88,
    dec_min: -8,
    dec_max: 2,
    icon: '',
  },
  {
    name: 'Región Cygnus X',
    description: 'Región de formación estelar masiva en Cisne',
    ra_min: 305,
    ra_max: 312,
    dec_min: 38,
    dec_max: 44,
    icon: '',
  },
  {
    name: 'Nebulosa de Carina',
    description: 'Región de formación estelar con Eta Carinae',
    ra_min: 158,
    ra_max: 165,
    dec_min: -62,
    dec_max: -58,
    icon: '',
  },
  {
    name: 'Nebulosa de la Tarántula',
    description: 'Región HII gigante en la Gran Nube de Magallanes',
    ra_min: 82,
    ra_max: 86,
    dec_min: -70,
    dec_max: -68,
    icon: '',
  },

  // ========================================================================
  // NUBES MOLECULARES Y POLVO
  // ========================================================================
  {
    name: 'Nube Molecular de Tauro',
    description: 'Gran nube de gas y polvo con formación estelar',
    ra_min: 63,
    ra_max: 70,
    dec_min: 14,
    dec_max: 30,
    icon: '',
  },
  {
    name: 'Complejo Ophiuchus',
    description: 'Región de nubes oscuras y formación estelar',
    ra_min: 245,
    ra_max: 250,
    dec_min: -25,
    dec_max: -20,
    icon: '',
  },

  // ========================================================================
  // CÚMULOS ESTELARES GRANDES
  // ========================================================================
  {
    name: 'Cúmulo de las Pléyades',
    description: 'Cúmulo abierto joven (M45)',
    ra_min: 55,
    ra_max: 58,
    dec_min: 23,
    dec_max: 25,
    icon: '',
  },
  {
    name: 'Cúmulo de las Híades',
    description: 'Cúmulo abierto cercano en Tauro',
    ra_min: 64,
    ra_max: 68,
    dec_min: 14,
    dec_max: 17,
    icon: '',
  },
  {
    name: 'Cúmulo Doble de Perseo',
    description: 'Par de cúmulos abiertos (NGC 869 y NGC 884)',
    ra_min: 33,
    ra_max: 36,
    dec_min: 56,
    dec_max: 58,
    icon: '',
  },

  // ========================================================================
  // BRAZOS ESPIRALES DE LA VÍA LÁCTEA
  // ========================================================================
  {
    name: 'Brazo de Sagitario',
    description: 'Brazo espiral interior de la Vía Láctea',
    ra_min: 260,
    ra_max: 280,
    dec_min: -35,
    dec_max: -20,
    icon: '',
  },
  {
    name: 'Brazo de Perseo',
    description: 'Brazo espiral exterior de la Vía Láctea',
    ra_min: 30,
    ra_max: 80,
    dec_min: 30,
    dec_max: 60,
    icon: '',
  },
  {
    name: 'Brazo de Orión (Local)',
    description: 'Espolón donde está el Sistema Solar',
    ra_min: 70,
    ra_max: 90,
    dec_min: -10,
    dec_max: 10,
    icon: '',
  },

  // ========================================================================
  // GALAXIAS CERCANAS
  // ========================================================================
  {
    name: 'Galaxia de Andrómeda',
    description: 'Galaxia espiral más cercana (M31)',
    ra_min: 9,
    ra_max: 12,
    dec_min: 40,
    dec_max: 42,
    icon: '',
  },
  {
    name: 'Galaxia del Triángulo',
    description: 'Galaxia espiral del Grupo Local (M33)',
    ra_min: 23,
    ra_max: 25,
    dec_min: 29,
    dec_max: 31,
    icon: '',
  },
  {
    name: 'Gran Nube de Magallanes',
    description: 'Galaxia enana satélite de la Vía Láctea',
    ra_min: 75,
    ra_max: 90,
    dec_min: -72,
    dec_max: -64,
    icon: '',
  },
  {
    name: 'Pequeña Nube de Magallanes',
    description: 'Galaxia enana satélite de la Vía Láctea',
    ra_min: 10,
    ra_max: 20,
    dec_min: -74,
    dec_max: -70,
    icon: '',
  },

  // ========================================================================
  // PLANO GALÁCTICO
  // ========================================================================
  {
    name: 'Plano Galáctico Norte',
    description: 'Zona cercana al disco de la Vía Láctea',
    ra_min: 0,
    ra_max: 360,
    dec_min: -15,
    dec_max: 15,
    icon: '',
  },

  // ========================================================================
  // POLOS GALÁCTICOS
  // ========================================================================
  {
    name: 'Polo Norte Galáctico',
    description: 'Zona perpendicular al disco galáctico',
    ra_min: 0,
    ra_max: 360,
    dec_min: 60,
    dec_max: 90,
    icon: '',
  },
  {
    name: 'Polo Sur Galáctico',
    description: 'Zona perpendicular al disco galáctico',
    ra_min: 0,
    ra_max: 360,
    dec_min: -90,
    dec_max: -60,
    icon: '',
  },

  // ========================================================================
  // DEFAULT: VÍA LÁCTEA (catch-all)
  // ========================================================================
  {
    name: 'Vía Láctea',
    description: 'Nuestra galaxia',
    ra_min: 0,
    ra_max: 360,
    dec_min: -90,
    dec_max: 90,
    icon: '',
  },
];

/**
 * Encuentra la región astronómica más específica para unas coordenadas
 */
export function findRegionByCoordinates(ra: number, dec: number): AstronomicalRegion {
  // Normalizar RA a rango 0-360
  const normalizedRa = ((ra % 360) + 360) % 360;

  // Buscar la región más específica (primera que coincida)
  for (const region of ASTRONOMICAL_REGIONS) {
    // Manejar casos donde la región cruza RA=0/360
    let raInRange = false;
    
    if (region.ra_min <= region.ra_max) {
      // Caso normal
      raInRange = normalizedRa >= region.ra_min && normalizedRa <= region.ra_max;
    } else {
      // Caso que cruza RA=0 (ej: 350-10)
      raInRange = normalizedRa >= region.ra_min || normalizedRa <= region.ra_max;
    }

    const decInRange = dec >= region.dec_min && dec <= region.dec_max;

    if (raInRange && decInRange) {
      return region;
    }
  }

  // Fallback (nunca debería llegar aquí por el catch-all "Vía Láctea")
  return ASTRONOMICAL_REGIONS[ASTRONOMICAL_REGIONS.length - 1];
}

/**
 * Obtiene una descripción contextual basada en la región
 */
export function getRegionContext(region: AstronomicalRegion): string {
  return `${region.icon ? region.icon + ' ' : ''}${region.name} - ${region.description}`;
}
