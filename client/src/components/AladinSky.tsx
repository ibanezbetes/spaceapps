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

    // Manipular el DOM después de que Aladin se inicialice
    setTimeout(() => {
      if (containerRef.current) {
        const aladinContainer = containerRef.current;
        
        // 1. Ocultar completamente el botón/menú de Stack (overlays) y controles de zoom/FOV
        const hideStackControls = () => {
          // Buscar todos los posibles selectores del control de Stack
          const stackSelectors = [
            '.aladin-stack-control',
            '.aladin-stackControl',
            'div[title*="Stack"]',
            'button[title*="Stack"]',
            'div[title*="overlay" i]',
            'button[title*="overlay" i]',
            '.aladin-fov', // Control de zoom y FOV
            '.aladin-horizontal-list.aladin-fov', // Contenedor completo del FOV
            '.aladin-zoom-in', // Botón zoom in
            '.aladin-zoom-out', // Botón zoom out
          ];
          
          stackSelectors.forEach(selector => {
            const elements = aladinContainer.querySelectorAll(selector);
            elements.forEach((el: any) => {
              el.style.display = 'none';
              el.style.visibility = 'hidden';
              el.style.opacity = '0';
              el.style.pointerEvents = 'none';
            });
          });
        };
        
        // 2. Aplicar estilos al botón de proyección (AIT)
        const styleProjectionControl = () => {
          const projectionSelectors = [
            '.aladin-projection-control',
            'div.aladin-projection-control',
            'button[title*="projection" i]',
          ];
          
          projectionSelectors.forEach(selector => {
            const elements = aladinContainer.querySelectorAll(selector);
            elements.forEach((el: any) => {
              // Aplicar estilos del contenedor
              el.style.position = 'absolute';
              el.style.top = '16px';
              el.style.right = '16px';
              el.style.left = 'auto';
              el.style.zIndex = '1000';
              el.style.background = 'rgba(30, 30, 30, 0.95)';
              el.style.border = '1px solid rgba(255, 255, 255, 0.1)';
              el.style.borderRadius = '8px';
              el.style.boxShadow = '0 2px 8px rgba(0,0,0,0.3)';
              el.style.padding = '14px 20px';
              el.style.height = '48px';
              el.style.boxSizing = 'border-box';
              el.style.fontSize = '14px';
              el.style.color = '#e0e6ed';
              el.style.fontWeight = '500';
              el.style.cursor = 'pointer';
              el.style.transition = 'all 0.2s';
              el.style.backdropFilter = 'blur(10px)';
              el.style.display = 'flex';
              el.style.alignItems = 'center';
              
              // Estilizar elementos internos (select, button, etc)
              const innerElements = el.querySelectorAll('select, button, input, span');
              innerElements.forEach((inner: any) => {
                inner.style.background = 'transparent';
                inner.style.border = 'none';
                inner.style.color = '#e0e6ed';
                inner.style.fontSize = '14px';
                inner.style.fontWeight = '500';
                inner.style.outline = 'none';
              });
            });
          });
        };
        
        // Ejecutar inmediatamente
        hideStackControls();
        styleProjectionControl();
        
        // Re-ejecutar después de un tiempo para asegurar que se apliquen
        setTimeout(() => {
          hideStackControls();
          styleProjectionControl();
        }, 500);
        
        // Observar cambios en el DOM por si Aladin añade elementos dinámicamente
        const observer = new MutationObserver(() => {
          hideStackControls();
          styleProjectionControl();
        });
        
        observer.observe(aladinContainer, {
          childList: true,
          subtree: true,
        });
        
        // Cleanup del observer
        return () => observer.disconnect();
      }
    }, 100);

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
