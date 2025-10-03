/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
  readonly VITE_TILES_URL: string;
  readonly VITE_PROJECTION_TYPE: 'gnomonic' | 'equirectangular';
  readonly VITE_IMAGE_CENTER_RA: string;
  readonly VITE_IMAGE_CENTER_DEC: string;
  readonly VITE_IMAGE_WIDTH_PX: string;
  readonly VITE_IMAGE_HEIGHT_PX: string;
  readonly VITE_PIXEL_SCALE_ARCSEC_PER_PX: string;
  readonly VITE_ENABLE_SSE: string;
  readonly VITE_DEFAULT_LIMIT: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
