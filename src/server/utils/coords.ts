/**
 * Parseo y conversión de coordenadas astronómicas
 * Soporta múltiples formatos de entrada para RA/Dec
 */

/**
 * Convierte HMS (Hours:Minutes:Seconds) a grados decimales
 * Ej: "17:45:40" → 266.41667 grados
 */
export function hmsToDecimalDegrees(hms: string): number {
  const parts = hms.trim().split(/[:\s]+/).map(parseFloat);
  
  if (parts.length !== 3 || parts.some(isNaN)) {
    throw new Error(`Formato HMS inválido: ${hms}. Use HH:MM:SS`);
  }

  const [hours, minutes, seconds] = parts;
  
  if (hours < 0 || hours >= 24 || minutes < 0 || minutes >= 60 || seconds < 0 || seconds >= 60) {
    throw new Error(`Valores HMS fuera de rango: ${hms}`);
  }

  return (hours + minutes / 60 + seconds / 3600) * 15; // 15 grados por hora
}

/**
 * Convierte DMS (Degrees:Minutes:Seconds) a grados decimales
 * Ej: "-28:56:10" → -28.93611 grados
 */
export function dmsToDecimalDegrees(dms: string): number {
  const trimmed = dms.trim();
  const isNegative = trimmed.startsWith('-');
  const absolute = trimmed.replace(/^[+-]/, '');
  const parts = absolute.split(/[:\s]+/).map(parseFloat);
  
  if (parts.length !== 3 || parts.some(isNaN)) {
    throw new Error(`Formato DMS inválido: ${dms}. Use ±DD:MM:SS`);
  }

  const [degrees, minutes, seconds] = parts;
  
  if (degrees < 0 || degrees >= 360 || minutes < 0 || minutes >= 60 || seconds < 0 || seconds >= 60) {
    throw new Error(`Valores DMS fuera de rango: ${dms}`);
  }

  const decimal = degrees + minutes / 60 + seconds / 3600;
  return isNegative ? -decimal : decimal;
}

/**
 * Intenta parsear coordenadas en múltiples formatos
 * 
 * Formatos soportados:
 * - Decimal: "266.41683 -29.00781"
 * - HMS/DMS: "17:45:40 -28:56:10"
 * - Mixto: "17h45m40s -28d56m10s"
 * 
 * @returns {ra: number, dec: number} en grados decimales, o null si falla
 */
export function parseCoordinates(input: string): { ra: number; dec: number } | null {
  const cleaned = input.trim();

  // Formato decimal simple: "266.41683 -29.00781"
  const decimalMatch = cleaned.match(/^([+-]?\d+\.?\d*)\s+([+-]?\d+\.?\d*)$/);
  if (decimalMatch) {
    const ra = parseFloat(decimalMatch[1]);
    const dec = parseFloat(decimalMatch[2]);
    
    if (isValidRA(ra) && isValidDec(dec)) {
      return { ra, dec };
    }
  }

  // Formato HMS DMS: "17:45:40 -28:56:10"
  const hmsDmsMatch = cleaned.match(/^(\d{1,2}:\d{1,2}:\d{1,2}(?:\.\d+)?)\s+([+-]?\d{1,2}:\d{1,2}:\d{1,2}(?:\.\d+)?)$/);
  if (hmsDmsMatch) {
    try {
      const ra = hmsToDecimalDegrees(hmsDmsMatch[1]);
      const dec = dmsToDecimalDegrees(hmsDmsMatch[2]);
      
      if (isValidRA(ra) && isValidDec(dec)) {
        return { ra, dec };
      }
    } catch {
      return null;
    }
  }

  // Formato astronómico con h/m/s y d/m/s: "17h45m40s -28d56m10s"
  const astroMatch = cleaned.match(/^(\d{1,2}h\d{1,2}m\d{1,2}(?:\.\d+)?s)\s+([+-]?\d{1,2}d\d{1,2}m\d{1,2}(?:\.\d+)?s)$/);
  if (astroMatch) {
    try {
      const raHms = astroMatch[1].replace(/h/g, ':').replace(/m/g, ':').replace(/s/g, '');
      const decDms = astroMatch[2].replace(/d/g, ':').replace(/m/g, ':').replace(/s/g, '');
      
      const ra = hmsToDecimalDegrees(raHms);
      const dec = dmsToDecimalDegrees(decDms);
      
      if (isValidRA(ra) && isValidDec(dec)) {
        return { ra, dec };
      }
    } catch {
      return null;
    }
  }

  return null;
}

/**
 * Valida que RA esté en [0, 360)
 */
export function isValidRA(ra: number): boolean {
  return !isNaN(ra) && ra >= 0 && ra < 360;
}

/**
 * Valida que Dec esté en [-90, 90]
 */
export function isValidDec(dec: number): boolean {
  return !isNaN(dec) && dec >= -90 && dec <= 90;
}

/**
 * Convierte grados decimales a formato HMS
 * Ej: 266.41667 → "17:45:40"
 */
export function decimalDegreesToHMS(degrees: number): string {
  const hours = degrees / 15;
  const h = Math.floor(hours);
  const minutesDecimal = (hours - h) * 60;
  const m = Math.floor(minutesDecimal);
  const s = (minutesDecimal - m) * 60;
  
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${s.toFixed(2).padStart(5, '0')}`;
}

/**
 * Convierte grados decimales a formato DMS
 * Ej: -28.93611 → "-28:56:10"
 */
export function decimalDegreesToDMS(degrees: number): string {
  const sign = degrees < 0 ? '-' : '+';
  const absolute = Math.abs(degrees);
  const d = Math.floor(absolute);
  const minutesDecimal = (absolute - d) * 60;
  const m = Math.floor(minutesDecimal);
  const s = (minutesDecimal - m) * 60;
  
  return `${sign}${String(d).padStart(2, '0')}:${String(m).padStart(2, '0')}:${s.toFixed(2).padStart(5, '0')}`;
}

/**
 * Calcula distancia angular entre dos puntos en la esfera celeste (fórmula haversine)
 * @param ra1 Right Ascension punto 1 (grados)
 * @param dec1 Declination punto 1 (grados)
 * @param ra2 Right Ascension punto 2 (grados)
 * @param dec2 Declination punto 2 (grados)
 * @returns Distancia angular en grados
 */
export function angularSeparation(ra1: number, dec1: number, ra2: number, dec2: number): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  
  const dRa = toRad(ra2 - ra1);
  const dDec = toRad(dec2 - dec1);
  
  const a = 
    Math.sin(dDec / 2) ** 2 +
    Math.cos(toRad(dec1)) * Math.cos(toRad(dec2)) * Math.sin(dRa / 2) ** 2;
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  
  return (c * 180) / Math.PI; // convertir radianes a grados
}
