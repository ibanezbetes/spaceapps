export const config = {
  apiBase: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000',
  tilesUrl: import.meta.env.VITE_TILES_URL || 'https://openseadragon.github.io/example-images/highsmith/highsmith.dzi',
  defaultProjection: (import.meta.env.VITE_PROJECTION_TYPE || 'gnomonic') as 'gnomonic' | 'equirectangular',
  defaultLimit: parseInt(import.meta.env.VITE_DEFAULT_LIMIT || '500', 10),
  enableSSE: import.meta.env.VITE_ENABLE_SSE === 'true',
  
  // Andromeda M31 reference coordinates (from env or defaults)
  andromedaCenter: {
    ra: parseFloat(import.meta.env.VITE_IMAGE_CENTER_RA || '10.6847083'), // degrees
    dec: parseFloat(import.meta.env.VITE_IMAGE_CENTER_DEC || '41.26875'),  // degrees
  },
  
  // Image dimensions and calibration (from env or defaults)
  imageWidth: parseInt(import.meta.env.VITE_IMAGE_WIDTH_PX || '20000', 10),  // pixels at max zoom
  imageHeight: parseInt(import.meta.env.VITE_IMAGE_HEIGHT_PX || '15000', 10), // pixels at max zoom
  
  // Projection calibration params (adjust based on actual image)
  projection: {
    centerRA: parseFloat(import.meta.env.VITE_IMAGE_CENTER_RA || '10.6847083'),
    centerDec: parseFloat(import.meta.env.VITE_IMAGE_CENTER_DEC || '41.26875'),
    pixelScale: parseFloat(import.meta.env.VITE_PIXEL_SCALE_ARCSEC_PER_PX || '0.5'), // arcseconds per pixel
    rotation: 0, // degrees
  },
};

