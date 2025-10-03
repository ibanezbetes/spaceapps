/**
 * Componente de Aladin Lite v3 integrado con React
 */

import React, { useEffect, useRef } from 'react';

interface AladinSkyProps {
  ra: number;
  dec: number;
  fov: number; // Field of view en grados
  onReady?: (aladin: any) => void;
  onClick?: (ra: number, dec: number, event?: MouseEvent) => void;
}

export const AladinSky: React.FC<AladinSkyProps> = ({ ra, dec, fov, onReady, onClick }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const aladinRef = useRef<any>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // @ts-ignore - Aladin cargado via CDN
    const aladin = window.A.aladin(containerRef.current, {
      survey: 'P/DSS2/color', // Base layer (DSS2 RGB composite)
      fov,
      target: `${ra} ${dec}`,
      projection: 'AIT', // Aitoff projection (all-sky friendly)
      showReticle: true,
      showZoomControl: true,
      showFullscreenControl: false, // Ocultar botón de pantalla completa
      showLayersControl: true,
      showGotoControl: false,
      showFrame: false, // Ocultar el selector de frame (ICRS/Galactic)
      showCooGrid: true,
      showCooGridControl: false, // Ocultar control de grid de coordenadas
      showSimbadPointerControl: false, // Ocultar control de Simbad
      showCooLocation: false, // OCULTAR control de ubicación/coordenadas
      showStackControl: false, // OCULTAR botón de Stack
      cooFrame: 'J2000',
    });

    // Guardar referencia
    aladinRef.current = aladin;

    // Click handler
    if (onClick) {
      aladin.on('click', (e: any) => {
        const position = aladin.getRaDec();
        // Pasar el evento nativo del mouse si está disponible
        onClick(position[0], position[1], e?.originalEvent || e);
      });
    }

    // Notificar que está listo
    if (onReady) {
      onReady(aladin);
    }

    // Cleanup
    return () => {
      // Aladin no tiene método oficial de cleanup, pero podemos limpiar eventos
    };
  }, []); // Solo al montar

  // Actualizar posición cuando cambien props
  useEffect(() => {
    if (aladinRef.current) {
      aladinRef.current.gotoRaDec(ra, dec);
      aladinRef.current.setFoV(fov);
    }
  }, [ra, dec, fov]);

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        height: '100%',
        position: 'relative',
      }}
    />
  );
};

/**
 * Helper: añadir overlay de imagen externa a Aladin
 */
export function addImageOverlay(aladin: any, imageUrl: string, opacity: number = 0.8) {
  try {
    const overlay = aladin.createImageSurvey(
      'Custom Overlay',
      'Custom Overlay',
      imageUrl,
      'equatorial',
      5 // max order
    );
    aladin.setOverlayImageLayer(overlay, opacity);
  } catch (error) {
    console.error('[ALADIN] Error adding overlay:', error);
  }
}

/**
 * Helper: añadir marcadores de catálogo
 */
export function addCatalogMarkers(
  aladin: any,
  sources: Array<{ ra: number; dec: number; name?: string }>,
  color: string = '#FF6B35'
) {
  const catalog = window.A.catalog({ name: 'Sources', sourceSize: 10, color });
  
  sources.forEach((source) => {
    catalog.addSources([
      window.A.source(source.ra, source.dec, {
        name: source.name || `${source.ra.toFixed(5)}, ${source.dec.toFixed(5)}`,
      }),
    ]);
  });

  aladin.addCatalog(catalog);
  return catalog;
}

/**
 * Helper: limpiar catálogos
 */
export function removeCatalog(aladin: any, catalog: any) {
  aladin.removeLayers([catalog]);
}
