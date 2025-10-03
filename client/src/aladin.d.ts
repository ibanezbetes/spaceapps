/**
 * Declaraciones de tipos para Aladin Lite v3 (cargado via CDN)
 */

declare global {
  interface Window {
    A: {
      aladin: (container: HTMLElement, options: any) => any;
      catalog: (options: any) => any;
      source: (ra: number, dec: number, data: any) => any;
    };
  }
}

export {};
