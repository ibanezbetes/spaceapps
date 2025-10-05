/**
 * Datos estáticos de regiones astronómicas para usar cuando el backend no esté disponible
 * Basado en REGIONES_ASTRONOMICAS.md
 */

export interface AstronomicalRegion {
  name: string;
  icon: string;
  description: string;
  raMin: number;
  raMax: number;
  decMin: number;
  decMax: number;
  priority: number; // Para regiones que se superponen, mayor prioridad = más específico
}

export const ASTRONOMICAL_REGIONS: AstronomicalRegion[] = [
  // Regiones de alta prioridad (más específicas)
  {
    name: "Complejo de Orión",
    icon: "🌟",
    description: "Gran región de formación estelar (M42, M43, Cabeza de Caballo)",
    raMin: 75, raMax: 95, decMin: -15, decMax: 15,
    priority: 10
  },
  {
    name: "Centro Galáctico",
    icon: "⚫",
    description: "Núcleo de la Vía Láctea con Sagitario A*",
    raMin: 260, raMax: 275, decMin: -35, decMax: -25,
    priority: 10
  },
  {
    name: "Cúmulo de las Pléyades",
    icon: "✨",
    description: "Cúmulo abierto joven (M45) en Tauro",
    raMin: 55, raMax: 58, decMin: 23, decMax: 25,
    priority: 10
  },
  {
    name: "Galaxia de Andrómeda",
    icon: "🌌",
    description: "Galaxia espiral más cercana (M31) - 2.5 millones años luz",
    raMin: 9, raMax: 12, decMin: 40, decMax: 43,
    priority: 10
  },
  {
    name: "Cygnus X",
    icon: "🌟",
    description: "Región masiva de formación estelar en la constelación del Cisne",
    raMin: 305, raMax: 315, decMin: 38, decMax: 45,
    priority: 9
  },
  {
    name: "Nebulosa de Carina",
    icon: "☁️",
    description: "Región de formación estelar con Eta Carinae",
    raMin: 155, raMax: 170, decMin: -65, decMax: -55,
    priority: 9
  },
  {
    name: "Cúmulo de las Híades",
    icon: "⭐",
    description: "Cúmulo abierto más cercano en Tauro",
    raMin: 64, raMax: 70, decMin: 14, decMax: 18,
    priority: 9
  },
  
  // Regiones de prioridad media (brazos espirales)
  {
    name: "Brazo de Sagitario",
    icon: "🌀",
    description: "Brazo espiral interior de la Vía Láctea",
    raMin: 240, raMax: 290, decMin: -45, decMax: -10,
    priority: 5
  },
  {
    name: "Brazo de Perseo",
    icon: "🌀", 
    description: "Brazo espiral exterior con regiones HII",
    raMin: 30, raMax: 90, decMin: 30, decMax: 60,
    priority: 5
  },
  {
    name: "Brazo de Orión",
    icon: "🌀",
    description: "Espolón local donde se encuentra el Sistema Solar",
    raMin: 60, raMax: 120, decMin: -30, decMax: 30,
    priority: 4
  },
  
  // Regiones generales del plano galáctico
  {
    name: "Plano Galáctico Norte",
    icon: "🌌",
    description: "Región rica en estrellas y polvo interestelar",
    raMin: 0, raMax: 360, decMin: 10, decMax: 45,
    priority: 2
  },
  {
    name: "Plano Galáctico Sur", 
    icon: "🌌",
    description: "Región del plano galáctico hacia el hemisferio sur",
    raMin: 0, raMax: 360, decMin: -45, decMax: -10,
    priority: 2
  },
  {
    name: "Polo Norte Galáctico",
    icon: "🧭",
    description: "Región hacia el polo norte de la galaxia, baja densidad estelar",
    raMin: 0, raMax: 360, decMin: 45, decMax: 90,
    priority: 3
  },
  {
    name: "Polo Sur Galáctico",
    icon: "🧭", 
    description: "Región hacia el polo sur de la galaxia, vista a galaxias externas",
    raMin: 0, raMax: 360, decMin: -90, decMax: -45,
    priority: 3
  },
  
  // Región por defecto (menor prioridad)
  {
    name: "Vía Láctea",
    icon: "🌌",
    description: "Nuestra galaxia espiral con 200-400 mil millones de estrellas",
    raMin: 0, raMax: 360, decMin: -90, decMax: 90,
    priority: 1
  }
];

/**
 * Encuentra la región astronómica más específica para las coordenadas dadas
 */
export function findAstronomicalRegion(ra: number, dec: number): AstronomicalRegion | null {
  // Normalizar RA a rango [0, 360)
  let normalizedRA = ra % 360;
  if (normalizedRA < 0) {
    normalizedRA += 360;
  }
  
  // Encontrar todas las regiones que contienen este punto
  const matchingRegions = ASTRONOMICAL_REGIONS.filter(region => {
    const inRA = normalizedRA >= region.raMin && normalizedRA <= region.raMax;
    const inDec = dec >= region.decMin && dec <= region.decMax;
    return inRA && inDec;
  });
  
  // Devolver la región con mayor prioridad
  if (matchingRegions.length === 0) {
    return null;
  }
  
  return matchingRegions.reduce((best, current) => 
    current.priority > best.priority ? current : best
  );
}
