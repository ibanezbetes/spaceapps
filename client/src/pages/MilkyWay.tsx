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
        timeout: 8000,
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
        // Fallback (no debería ocurrir ya que siempre hay una región)
        setClickPopup({
          visible: true,
          ra: clickRa,
          dec: clickDec,
          loading: false,
        });
      }
    } catch (error) {
      console.log('[CLICK] Error buscando región, mostrando solo coordenadas');
      // Error - mostrar solo coordenadas
      setClickPopup({
        visible: true,
        ra: clickRa,
        dec: clickDec,
        loading: false,
      });
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
      <div style={styles.searchContainer}>
        <div style={styles.logoContainer}>
          <img 
            src="https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/f/1ffb340c-45b5-4137-8b12-98f2fe9645c6/de4os45-1dc86668-425d-4ef8-9e09-8a1397b8d813.png/v1/fill/w_613,h_407/angry_buzz_lightyear__png__by_autism79_de4os45-fullview.png?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1cm46YXBwOjdlMGQxODg5ODIyNjQzNzNhNWYwZDQxNWVhMGQyNmUwIiwiaXNzIjoidXJuOmFwcDo3ZTBkMTg4OTgyMjY0MzczYTVmMGQ0MTVlYTBkMjZlMCIsIm9iaiI6W1t7ImhlaWdodCI6Ijw9NDA3IiwicGF0aCI6Ii9mLzFmZmIzNDBjLTQ1YjUtNDEzNy04YjEyLTk4ZjJmZTk2NDVjNi9kZTRvczQ1LTFkYzg2NjY4LTQyNWQtNGVmOC05ZTA5LThhMTM5N2I4ZDgxMy5wbmciLCJ3aWR0aCI6Ijw9NjEzIn1dXSwiYXVkIjpbInVybjpzZXJ2aWNlOmltYWdlLm9wZXJhdGlvbnMiXX0.avoOwnHGD1paE2egJ7dayB-dJwG2WWglkGq8-bQSMI8" 
            alt="Buzz Lightyear" 
            style={styles.logoImage}
            onError={(e) => {
              e.currentTarget.src = 'https://i.imgur.com/7ZqKX5j.png';
            }}
          />
          <span style={styles.logo}>Bug Lightyear</span>
        </div>
        <div style={styles.searchBoxWrapper}>
          <SearchBar onSearch={handleSearch} />
        </div>
      </div>

      {/* Botón KIDS - Sistema Solar */}
      <button 
        style={styles.kidsButton}
        onClick={() => setShowSolarSystem(true)}
        title="¡Explora el Sistema Solar!"
      >
        🪐 Sistema Solar
      </button>

      {/* Botón de menú lateral (ejemplos) */}
      <button 
        className="menu-button"
        style={styles.menuButton}
        onClick={() => setShowExamples(!showExamples)}
        title="Ver ejemplos"
      >
        ≡
      </button>

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
          <h3 style={styles.infoCardTitle}>
            {searchResult.note || 'Información'}
          </h3>
          <div style={styles.infoCardContent}>
            <div style={styles.infoRow}>
              <span style={styles.infoLabel}>Tipo:</span>
              <span style={styles.infoValue}>{searchResult.type}</span>
            </div>
            <div style={styles.infoRow}>
              <span style={styles.infoLabel}>RA:</span>
              <span style={styles.infoValue}>{searchResult.ra.toFixed(5)}°</span>
            </div>
            <div style={styles.infoRow}>
              <span style={styles.infoLabel}>Dec:</span>
              <span style={styles.infoValue}>{searchResult.dec.toFixed(5)}°</span>
            </div>
            <div style={styles.infoRow}>
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

  // Botón Sistema Solar
  kidsButton: {
    position: 'absolute',
    bottom: '30px',
    left: '16px',
    padding: '12px 24px',
    background: 'linear-gradient(135deg, #f472b6 0%, #a855f7 50%, #3b82f6 100%)',
    border: '2px solid rgba(255, 255, 255, 0.3)',
    borderRadius: '24px',
    fontSize: '16px',
    fontWeight: 'bold',
    color: 'white',
    cursor: 'pointer',
    boxShadow: '0 4px 12px rgba(244, 114, 182, 0.4)',
    zIndex: 1001,
    transition: 'all 0.3s',
    animation: 'glow 2s ease-in-out infinite alternate',
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
