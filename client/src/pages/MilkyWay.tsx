/**
 * Página principal del Milky Way Explorer
 */

import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { AladinSky } from '../components/AladinSky';
import { SearchBar } from '../components/SearchBar';
import { ClickPopup } from '../components/ClickPopup';
import { SolarSystemMap } from '../components/SolarSystemMap';

export const MilkyWay: React.FC = () => {
  // Añadir animaciones CSS
  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      @keyframes glow {
        from {
          box-shadow: 0 4px 12px rgba(244, 114, 182, 0.4);
        }
        to {
          box-shadow: 0 4px 20px rgba(244, 114, 182, 0.8), 0 0 30px rgba(168, 85, 247, 0.4);
        }
      }
      
      @keyframes fadeInUp {
        from {
          opacity: 0;
          transform: translateY(30px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      
      @keyframes scaleIn {
        from {
          opacity: 0;
          transform: scale(0.8);
        }
        to {
          opacity: 1;
          transform: scale(1);
        }
      }
      
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      
      @keyframes bounce {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-10px); }
      }
      
      @keyframes pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.7; }
      }

      /* ========================================
         RESPONSIVE DESIGN - MOBILE
         ======================================== */
      
      /* Tablets y pantallas medianas (hasta 768px) */
      @media (max-width: 768px) {
        .search-container {
          top: 12px !important;
          max-width: calc(100% - 80px) !important;
          gap: 8px !important;
        }

        .logo-container {
          padding: 6px 12px !important;
          height: 40px !important;
        }

        .logo-text {
          font-size: 14px !important;
        }

        .logo-image {
          height: 32px !important;
        }

        .kids-image {
          height: 40px !important;
        }

        .info-card {
          bottom: 16px !important;
          left: 16px !important;
          width: calc(100% - 32px) !important;
          max-width: 340px !important;
        }

        .side-panel {
          width: 240px !important;
        }
      }

      /* Móviles (hasta 480px) */
      @media (max-width: 480px) {
        /* Ocultar elementos DESKTOP completamente */
        .menu-button-desktop,
        .logo-container-desktop,
        .kids-image-desktop {
          display: none !important;
          height: 0 !important;
          width: 0 !important;
          min-height: 0 !important;
          min-width: 0 !important;
          max-height: 0 !important;
          max-width: 0 !important;
          overflow: hidden !important;
          opacity: 0 !important;
          visibility: hidden !important;
          position: absolute !important;
          pointer-events: none !important;
          margin: 0 !important;
          padding: 0 !important;
          border: none !important;
          flex: 0 !important;
          flex-shrink: 0 !important;
        }

        .search-container {
          flex-direction: column !important;
          top: 8px !important;
          left: 8px !important;
          right: 8px !important;
          transform: none !important;
          max-width: none !important;
          width: calc(100% - 16px) !important;
          gap: 8px !important;
          align-items: stretch !important;
          padding: 0 !important;
        }

        /* Fila 1: Menú + Logo + Bug Lightyear */
        .top-row-mobile {
          display: flex !important;
          flex-direction: row !important;
          align-items: center !important;
          gap: 8px !important;
          width: 100% !important;
          margin: 0 !important;
          padding: 0 !important;
        }

        .menu-button {
          position: static !important;
          width: 44px !important;
          height: 44px !important;
          font-size: 18px !important;
          flex-shrink: 0 !important;
        }

        .logo-container-mobile {
          flex: 1 !important;
          width: auto !important;
          justify-content: flex-start !important;
          padding: 8px 12px !important;
          height: 44px !important;
          display: flex !important;
        }

        .logo-text {
          font-size: 15px !important;
        }

        .logo-image {
          height: 36px !important;
        }

        /* OCULTAR completamente elementos desktop en mobile */
        .kids-image-desktop {
          display: none !important;
          visibility: hidden !important;
          opacity: 0 !important;
          position: absolute !important;
          width: 0 !important;
          height: 0 !important;
          pointer-events: none !important;
          overflow: hidden !important;
          order: -999 !important;
          z-index: -999 !important;
        }

        /* Fila 2: Barra de búsqueda */
        .search-box-wrapper {
          width: 100% !important;
          order: 2 !important;
          margin: 0 !important;
          padding: 0 !important;
          flex: none !important;
        }

        /* Fila 3: KIDS + AIT */
        .bottom-row-mobile {
          display: flex !important;
          flex-direction: row !important;
          gap: 8px !important;
          width: 100% !important;
          order: 3 !important;
          margin: 0 !important;
          padding: 0 !important;
        }

        .kids-image-mobile {
          position: static !important;
          height: 44px !important;
          width: auto !important;
          flex: 1 !important;
          object-fit: contain !important;
          background: rgba(30, 30, 30, 0.95) !important;
          border: 1px solid rgba(255, 255, 255, 0.1) !important;
          padding: 4px !important;
          border-radius: 8px !important;
          display: block !important;
        }

        .ait-button {
          height: 44px !important;
          flex: 1 !important;
          background: rgba(30, 30, 30, 0.95) !important;
          border: 1px solid rgba(255, 255, 255, 0.1) !important;
          border-radius: 8px !important;
          color: #e0e6ed !important;
          font-size: 14px !important;
          font-weight: 600 !important;
          cursor: pointer !important;
          transition: all 0.2s !important;
          padding: 8px 12px !important;
        }

        .side-panel {
          top: auto !important;
          margin-top: 180px !important;
          left: 8px !important;
          width: calc(100% - 16px) !important;
          max-width: 280px !important;
          max-height: calc(100vh - 200px) !important;
        }

        .info-card {
          bottom: 8px !important;
          left: 8px !important;
          right: 8px !important;
          width: calc(100% - 16px) !important;
          max-width: none !important;
          padding: 16px !important;
        }

        .info-card-title {
          font-size: 16px !important;
        }

        .info-row {
          font-size: 13px !important;
        }

        .survey-chip {
          font-size: 11px !important;
          padding: 5px 10px !important;
        }
      }

      /* Móviles pequeños (hasta 360px) */
      @media (max-width: 360px) {
        .logo-text {
          font-size: 14px !important;
        }

        .logo-image {
          height: 32px !important;
        }

        .menu-button {
          width: 36px !important;
          height: 36px !important;
          font-size: 16px !important;
        }

        .info-card {
          padding: 12px !important;
        }

        .info-card-title {
          font-size: 15px !important;
        }
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // Estado de la vista
  const [ra, setRa] = useState(266.41683); // Centro Galáctico por defecto
  const [dec, setDec] = useState(-29.00781);
  const [fov, setFov] = useState(6);
  
  // Estado de modo Sistema Solar
  const [showSolarSystem, setShowSolarSystem] = useState(false);
  
  // Estado de info
  const [searchResult, setSearchResult] = useState<any>(null);
  
  // Estado del popup de click
  const [clickPopup, setClickPopup] = useState<{
    visible: boolean;
    ra: number;
    dec: number;
    regionName?: string;
    regionDescription?: string;
    regionIcon?: string;
    loading: boolean;
  } | null>(null);
  
  // Referencia a Aladin
  const aladinRef = useRef<any>(null);

  // Detectar si es móvil
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 480);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleSearch = (result: any) => {
    console.log('[SEARCH RESULT]', result);
    
    setSearchResult(result);
    setRa(result.ra);
    setDec(result.dec);
    setFov(result.fov || 4);
  };

  const handleAladinReady = (aladin: any) => {
    console.log('[ALADIN] Ready!');
    aladinRef.current = aladin;
  };

  const handleClick = async (clickRa: number, clickDec: number) => {
    console.log(`[CLICK] RA=${clickRa}, Dec=${clickDec}`);
    
    // Mostrar popup inmediatamente con "loading"
    setClickPopup({
      visible: true,
      ra: clickRa,
      dec: clickDec,
      loading: true,
    });

    try {
      // Buscar región astronómica para las coordenadas clickeadas
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      const response = await axios.get(`${apiUrl}/api/search/nearby`, {
        params: {
          ra: clickRa,
          dec: clickDec,
        },
        timeout: 5000, // Reducido a 5 segundos
      });

      // Actualizar popup con la región encontrada
      if (response.data && response.data.found) {
        setClickPopup({
          visible: true,
          ra: clickRa,
          dec: clickDec,
          regionName: response.data.name,
          regionDescription: response.data.description,
          regionIcon: response.data.icon,
          loading: false,
        });
      } else {
        // Fallback: usar datos estáticos
        const { findAstronomicalRegion } = await import('../data/astronomicalRegions');
        const region = findAstronomicalRegion(clickRa, clickDec);
        
        setClickPopup({
          visible: true,
          ra: clickRa,
          dec: clickDec,
          regionName: region?.name,
          regionDescription: region?.description,
          regionIcon: region?.icon,
          loading: false,
        });
      }
    } catch (error) {
      console.log('[CLICK] Backend no disponible, usando datos estáticos');
      
      // Fallback: usar datos estáticos de regiones astronómicas
      try {
        const { findAstronomicalRegion } = await import('../data/astronomicalRegions');
        const region = findAstronomicalRegion(clickRa, clickDec);
        
        if (region) {
          setClickPopup({
            visible: true,
            ra: clickRa,
            dec: clickDec,
            regionName: region.name,
            regionDescription: region.description,
            regionIcon: region.icon,
            loading: false,
          });
        } else {
          // Si no se encuentra región, mostrar solo coordenadas
          setClickPopup({
            visible: true,
            ra: clickRa,
            dec: clickDec,
            loading: false,
          });
        }
      } catch (fallbackError) {
        console.error('[CLICK] Error en fallback:', fallbackError);
        // Último recurso: solo coordenadas
        setClickPopup({
          visible: true,
          ra: clickRa,
          dec: clickDec,
          loading: false,
        });
      }
    }
  };

  const handleClosePopup = () => {
    setClickPopup(null);
  };

  const [showExamples, setShowExamples] = useState(false);

  const quickAccessLocations = [
    { name: 'Centro Galáctico', ra: 266.41683, dec: -29.00781, fov: 6 },
    { name: 'Complejo de Orión', ra: 83.82208, dec: -5.39111, fov: 1.5 },
    { name: 'Cygnus X', ra: 308.5, dec: 41.0, fov: 5 },
    { name: 'Pléyades', ra: 56.869089, dec: 24.105313, fov: 2 },
    { name: 'Galaxia de Andrómeda', ra: 10.684, dec: 41.269, fov: 2 },
    { name: 'Nebulosa de Carina', ra: 161.265, dec: -59.868, fov: 2 },
  ];

  // Si está en modo Sistema Solar, mostrar el mapa interactivo
  if (showSolarSystem) {
    return <SolarSystemMap onClose={() => setShowSolarSystem(false)} />;
  }

  return (
    <div style={styles.container}>
      {/* Mapa de fondo (fullscreen) */}
      <div style={styles.mapContainer}>
        <AladinSky
          ra={ra}
          dec={dec}
          fov={fov}
          onReady={handleAladinReady}
          onClick={handleClick}
        />
      </div>

      {/* Barra de búsqueda flotante superior (estilo Google Maps) */}
      <div className="search-container" style={styles.searchContainer}>
        {/* Logo + Bug Lightyear - visible SOLO en DESKTOP */}
        {!isMobile && (
          <div className="logo-container logo-container-desktop" style={styles.logoContainer}>
            <img 
              src="https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/f/1ffb340c-45b5-4137-8b12-98f2fe9645c6/de4os45-1dc86668-425d-4ef8-9e09-8a1397b8d813.png/v1/fill/w_613,h_407/angry_buzz_lightyear__png__by_autism79_de4os45-fullview.png?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1cm46YXBwOjdlMGQxODg5ODIyNjQzNzNhNWYwZDQxNWVhMGQyNmUwIiwiaXNzIjoidXJuOmFwcDo3ZTBkMTg4OTgyMjY0MzczYTVmMGQ0MTVlYTBkMjZlMCIsIm9iaiI6W1t7ImhlaWdodCI6Ijw9NDA3IiwicGF0aCI6Ii9mLzFmZmIzNDBjLTQ1YjUtNDEzNy04YjEyLTk4ZjJmZTk2NDVjNi9kZTRvczQ1LTFkYzg2NjY4LTQyNWQtNGVmOC05ZTA5LThhMTM5N2I4ZDgxMy5wbmciLCJ3aWR0aCI6Ijw9NjEzIn1dXSwiYXVkIjpbInVybjpzZXJ2aWNlOmltYWdlLm9wZXJhdGlvbnMiXX0.avoOwnHGD1paE2egJ7dayB-dJwG2WWglkGq8-bQSMI8" 
              alt="Buzz Lightyear" 
              className="logo-image"
              style={styles.logoImage}
              onError={(e) => {
                e.currentTarget.src = 'https://i.imgur.com/7ZqKX5j.png';
              }}
            />
            <span className="logo-text" style={styles.logo}>Bug Lightyear</span>
          </div>
        )}

        {/* Fila 1 MÓVIL: Menú + Logo + Bug Lightyear */}
        {isMobile && (
          <div className="top-row-mobile" style={styles.topRowMobile}>
            <button 
              className="menu-button"
              style={styles.menuButtonMobile}
              onClick={() => setShowExamples(!showExamples)}
              title="Ver ejemplos"
            >
              ≡
            </button>
            <div className="logo-container logo-container-mobile" style={styles.logoContainer}>
              <img 
                src="https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/f/1ffb340c-45b5-4137-8b12-98f2fe9645c6/de4os45-1dc86668-425d-4ef8-9e09-8a1397b8d813.png/v1/fill/w_613,h_407/angry_buzz_lightyear__png__by_autism79_de4os45-fullview.png?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1cm46YXBwOjdlMGQxODg5ODIyNjQzNzNhNWYwZDQxNWVhMGQyNmUwIiwiaXNzIjoidXJuOmFwcDo3ZTBkMTg4OTgyMjY0MzczYTVmMGQ0MTVlYTBkMjZlMCIsIm9iaiI6W1t7ImhlaWdodCI6Ijw9NDA3IiwicGF0aCI6Ii9mLzFmZmIzNDBjLTQ1YjUtNDEzNy04YjEyLTk4ZjJmZTk2NDVjNi9kZTRvczQ1LTFkYzg2NjY4LTQyNWQtNGVmOC05ZTA5LThhMTM5N2I4ZDgxMy5wbmciLCJ3aWR0aCI6Ijw9NjEzIn1dXSwiYXVkIjpbInVybjpzZXJ2aWNlOmltYWdlLm9wZXJhdGlvbnMiXX0.avoOwnHGD1paE2egJ7dayB-dJwG2WWglkGq8-bQSMI8" 
                alt="Buzz Lightyear" 
                className="logo-image"
                style={styles.logoImage}
                onError={(e) => {
                  e.currentTarget.src = 'https://i.imgur.com/7ZqKX5j.png';
                }}
              />
              <span className="logo-text" style={styles.logo}>Bug Lightyear</span>
            </div>
          </div>
        )}

        {/* Fila 2: Barra de búsqueda */}
        <div className="search-box-wrapper" style={styles.searchBoxWrapper}>
          <SearchBar onSearch={handleSearch} />
        </div>

        {/* KIDS imagen - visible SOLO en DESKTOP */}
        {!isMobile && (
          <img 
            src="https://raw.githubusercontent.com/ibanezbetes/spaceapps/main/kids.png" 
            alt="Sistema Solar" 
            className="kids-image kids-image-desktop"
            style={styles.kidsImage}
            onClick={() => setShowSolarSystem(true)}
            title="¡Explora el Sistema Solar!"
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
            }}
            onError={(e) => {
              e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="48" height="48"%3E%3Ctext y="32" font-size="32"%3E🪐%3C/text%3E%3C/svg%3E';
            }}
          />
        )}

        {/* Fila 3 MÓVIL: KIDS + AIT */}
        {isMobile && (
          <div className="bottom-row-mobile" style={styles.bottomRowMobile}>
            <img 
              src="https://raw.githubusercontent.com/ibanezbetes/spaceapps/main/kids.png" 
              alt="Sistema Solar" 
              className="kids-image kids-image-mobile"
              style={styles.kidsImage}
              onClick={() => setShowSolarSystem(true)}
              title="¡Explora el Sistema Solar!"
              onError={(e) => {
                e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="48" height="48"%3E%3Ctext y="32" font-size="32"%3E🪐%3C/text%3E%3C/svg%3E';
              }}
            />
            <button
              className="ait-button"
              style={styles.aitButton}
              onClick={() => alert('Proyección AIT - Próximamente')}
              title="Cambiar proyección"
            >
              AIT
            </button>
          </div>
        )}
      </div>

      {/* Botón de menú lateral (visible solo en desktop) */}
      {!isMobile && (
        <button 
          className="menu-button menu-button-desktop"
          style={styles.menuButton}
          onClick={() => setShowExamples(!showExamples)}
          title="Ver ejemplos"
        >
          ≡
        </button>
      )}

      {/* Panel lateral de ejemplos (expandible) */}
      {showExamples && (
        <div className="side-panel" style={styles.sidePanel}>
          <div style={styles.sidePanelHeader}>
            <h3 style={styles.sidePanelTitle}>Lugares de Interés</h3>
            <button 
              className="close-button"
              style={styles.closeSidePanel}
              onClick={() => setShowExamples(false)}
            >
              ×
            </button>
          </div>
          <div style={styles.examplesList}>
            {quickAccessLocations.map((location) => (
              <button
                key={location.name}
                className="example-button"
                style={styles.exampleButton}
                onClick={() => {
                  handleSearch({ 
                    ra: location.ra, 
                    dec: location.dec, 
                    fov: location.fov, 
                    type: 'bookmark', 
                    note: location.name 
                  });
                  setShowExamples(false);
                }}
              >
                <span style={styles.exampleName}>{location.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Card flotante de información (aparece cuando hay búsqueda) */}
      {searchResult && (
        <div className="info-card" style={styles.infoCard}>
          <button 
            className="close-button"
            style={styles.closeInfoCard}
            onClick={() => setSearchResult(null)}
          >
            ×
          </button>
          <h3 className="info-card-title" style={styles.infoCardTitle}>
            {searchResult.note || 'Información'}
          </h3>
          <div style={styles.infoCardContent}>
            <div className="info-row" style={styles.infoRow}>
              <span style={styles.infoLabel}>Tipo:</span>
              <span style={styles.infoValue}>{searchResult.type}</span>
            </div>
            <div className="info-row" style={styles.infoRow}>
              <span style={styles.infoLabel}>RA:</span>
              <span style={styles.infoValue}>{searchResult.ra.toFixed(5)}°</span>
            </div>
            <div className="info-row" style={styles.infoRow}>
              <span style={styles.infoLabel}>Dec:</span>
              <span style={styles.infoValue}>{searchResult.dec.toFixed(5)}°</span>
            </div>
            <div className="info-row" style={styles.infoRow}>
              <span style={styles.infoLabel}>FOV:</span>
              <span style={styles.infoValue}>{searchResult.fov}°</span>
            </div>
            
            {searchResult.suggestions && searchResult.suggestions.length > 0 && (
              <div style={styles.surveysSection}>
                <h4 style={styles.surveysTitle}>Surveys Recomendados</h4>
                <div style={styles.surveysList}>
                  {searchResult.suggestions.slice(0, 3).map((s: any) => (
                    <div key={s.id} className="survey-chip" style={styles.surveyChip}>
                      {s.band} {s.wavelength_um}µm
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Click Popup */}
      {clickPopup && (
        <ClickPopup
          ra={clickPopup.ra}
          dec={clickPopup.dec}
          regionName={clickPopup.regionName}
          regionDescription={clickPopup.regionDescription}
          regionIcon={clickPopup.regionIcon}
          loading={clickPopup.loading}
          onClose={handleClosePopup}
        />
      )}
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  // Contenedor principal - fullscreen
  container: {
    width: '100vw',
    height: '100vh',
    position: 'relative',
    overflow: 'hidden',
    background: '#0a0e1a',
  },
  
  // Mapa ocupa todo el espacio
  mapContainer: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
  },
  
  // Barra de búsqueda flotante superior (estilo Google Maps)
  searchContainer: {
    position: 'absolute',
    top: '16px',
    left: '50%',
    transform: 'translateX(-50%)',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    zIndex: 1000,
    maxWidth: '700px',
    width: 'calc(100% - 32px)',
  },
  
  logoContainer: {
    background: 'rgba(30, 30, 30, 0.95)',
    padding: '8px 20px',
    borderRadius: '8px',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
    backdropFilter: 'blur(10px)',
    whiteSpace: 'nowrap',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    height: '48px',
  },
  
  logo: {
    fontSize: '16px',
    fontWeight: 600,
    color: '#e0e6ed',
    display: 'flex',
    alignItems: 'center',
  },
  
  logoImage: {
    height: '40px',
    width: 'auto',
    borderRadius: '4px',
    objectFit: 'contain' as const,
    border: '2px solid rgba(255, 255, 255, 0.1)',
  },
  
  searchBoxWrapper: {
    flex: 1,
    background: 'rgba(30, 30, 30, 0.95)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '8px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
    backdropFilter: 'blur(10px)',
    overflow: 'hidden',
  },
  
  // Botón de menú lateral (hamburguesa)
  menuButton: {
    position: 'absolute',
    top: '16px',
    left: '16px',
    width: '44px',
    height: '44px',
    background: 'rgba(30, 30, 30, 0.95)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '8px',
    fontSize: '20px',
    color: '#e0e6ed',
    cursor: 'pointer',
    boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
    zIndex: 1001,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s',
  },

  // Imagen KIDS - Sistema Solar (clickeable)
  kidsImage: {
    height: '48px',
    width: 'auto',
    display: 'block',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    flexShrink: 0,
  },

  // Fila superior móvil (Menú + Logo + Bug Lightyear) - oculta en desktop
  topRowMobile: {
    display: 'none',
  },

  // Botón de menú dentro de la fila móvil
  menuButtonMobile: {
    width: '44px',
    height: '44px',
    background: 'rgba(30, 30, 30, 0.95)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '8px',
    fontSize: '20px',
    color: '#e0e6ed',
    cursor: 'pointer',
    boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s',
  },

  // Fila inferior móvil (KIDS + AIT) - oculta en desktop
  bottomRowMobile: {
    display: 'none',
  },

  // Botón AIT
  aitButton: {
    height: '48px',
    background: 'rgba(30, 30, 30, 0.95)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '8px',
    color: '#e0e6ed',
    fontSize: '16px',
    fontWeight: 600,
    cursor: 'pointer',
    boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
    transition: 'all 0.2s',
    padding: '8px 16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  // Panel lateral de ejemplos
  sidePanel: {
    position: 'absolute',
    top: '76px',
    left: '16px',
    width: '280px',
    maxHeight: 'calc(100vh - 96px)',
    background: 'rgba(30, 30, 30, 0.95)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '8px',
    boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
    zIndex: 999,
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column' as const,
  },
  
  sidePanelHeader: {
    padding: '16px',
    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  
  sidePanelTitle: {
    margin: 0,
    fontSize: '16px',
    fontWeight: 600,
    color: '#e0e6ed',
  },
  
  closeSidePanel: {
    background: 'none',
    border: 'none',
    fontSize: '20px',
    color: '#8b96a5',
    cursor: 'pointer',
    padding: '4px',
    lineHeight: 1,
  },
  
  examplesList: {
    padding: '8px',
    overflowY: 'auto' as const,
  },
  
  exampleButton: {
    width: '100%',
    padding: '12px 16px',
    marginBottom: '4px',
    background: 'transparent',
    border: 'none',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    cursor: 'pointer',
    transition: 'background 0.2s',
    textAlign: 'left' as const,
  },
  
  exampleName: {
    fontSize: '14px',
    color: '#e0e6ed',
    fontWeight: 500,
  },
  
  // Card de información flotante (aparece al buscar)
  infoCard: {
    position: 'absolute',
    bottom: '24px',
    left: '24px',
    width: '340px',
    background: 'rgba(30, 30, 30, 0.95)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '12px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
    zIndex: 998,
    padding: '20px',
    backdropFilter: 'blur(10px)',
  },
  
  closeInfoCard: {
    position: 'absolute',
    top: '12px',
    right: '12px',
    background: 'none',
    border: 'none',
    fontSize: '18px',
    color: '#8b96a5',
    cursor: 'pointer',
    padding: '4px',
    lineHeight: 1,
  },
  
  infoCardTitle: {
    margin: '0 0 16px 0',
    fontSize: '18px',
    fontWeight: 600,
    color: '#e0e6ed',
    paddingRight: '24px',
  },
  
  infoCardContent: {
    fontSize: '14px',
    color: '#b8c5d6',
  },
  
  infoRow: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '10px',
    paddingBottom: '10px',
    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
  },
  
  infoLabel: {
    fontWeight: 500,
    color: '#8b96a5',
  },
  
  infoValue: {
    color: '#e0e6ed',
    fontWeight: 500,
  },
  
  surveysSection: {
    marginTop: '16px',
    paddingTop: '16px',
    borderTop: '1px solid rgba(255, 255, 255, 0.1)',
  },
  
  surveysTitle: {
    margin: '0 0 12px 0',
    fontSize: '14px',
    fontWeight: 600,
    color: '#e0e6ed',
  },
  
  surveysList: {
    display: 'flex',
    flexWrap: 'wrap' as const,
    gap: '8px',
  },
  
  surveyChip: {
    padding: '6px 12px',
    background: 'rgba(102, 126, 234, 0.2)',
    color: '#a5b4fc',
    border: '1px solid rgba(102, 126, 234, 0.3)',
    borderRadius: '16px',
    fontSize: '12px',
    fontWeight: 500,
  },
};
