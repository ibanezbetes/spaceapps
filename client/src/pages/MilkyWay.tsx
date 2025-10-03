/**
 * Página principal del Milky Way Explorer
 */

import React, { useState, useRef } from 'react';
import { AladinSky } from '../components/AladinSky';
import { SearchBar } from '../components/SearchBar';

export const MilkyWay: React.FC = () => {
  // Estado de la vista
  const [ra, setRa] = useState(266.41683); // Centro Galáctico por defecto
  const [dec, setDec] = useState(-29.00781);
  const [fov, setFov] = useState(6);
  
  // Estado de info
  const [searchResult, setSearchResult] = useState<any>(null);
  
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

  const handleClick = (clickRa: number, clickDec: number) => {
    console.log(`[CLICK] RA=${clickRa}, Dec=${clickDec}`);
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <header style={styles.header}>
        <h1 style={styles.title}>🌌 Milky Way Explorer</h1>
        <p style={styles.subtitle}>NASA/IPAC IRSA + SkyView + Aladin Lite v3</p>
      </header>

      {/* Search Bar */}
      <div style={styles.searchBar}>
        <SearchBar onSearch={handleSearch} />
      </div>

      {/* Main Viewer */}
      <div style={styles.viewer}>
        <AladinSky
          ra={ra}
          dec={dec}
          fov={fov}
          onReady={handleAladinReady}
          onClick={handleClick}
        />
      </div>

      {/* Info Panel */}
      {searchResult && (
        <div style={styles.infoPanel}>
          <h3 style={styles.infoPanelTitle}>Información</h3>
          <div style={styles.infoPanelContent}>
            <p><strong>Tipo:</strong> {searchResult.type}</p>
            <p><strong>RA:</strong> {searchResult.ra.toFixed(5)}°</p>
            <p><strong>Dec:</strong> {searchResult.dec.toFixed(5)}°</p>
            <p><strong>FOV:</strong> {searchResult.fov}°</p>
            {searchResult.note && <p><strong>Nota:</strong> {searchResult.note}</p>}
            
            {searchResult.suggestions && searchResult.suggestions.length > 0 && (
              <>
                <h4 style={styles.suggestionsTitle}>Surveys Sugeridos:</h4>
                <ul style={styles.suggestionsList}>
                  {searchResult.suggestions.map((s: any) => (
                    <li key={s.id} style={styles.suggestionItem}>
                      {s.survey} ({s.wavelength_um}µm)
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
        </div>
      )}

      {/* Bookmarks (Quick Access) */}
      <div style={styles.bookmarks}>
        <h4 style={styles.bookmarksTitle}>⭐ Quick Access</h4>
        <button
          style={styles.bookmarkButton}
          onClick={() => handleSearch({ ra: 266.41683, dec: -29.00781, fov: 6, type: 'bookmark', note: 'Centro Galáctico' })}
        >
          Centro Galáctico
        </button>
        <button
          style={styles.bookmarkButton}
          onClick={() => handleSearch({ ra: 308.5, dec: 41.0, fov: 5, type: 'bookmark', note: 'Cygnus X' })}
        >
          Cygnus X
        </button>
        <button
          style={styles.bookmarkButton}
          onClick={() => handleSearch({ ra: 83.82208, dec: -5.39111, fov: 1.5, type: 'bookmark', note: 'Nebulosa de Orión' })}
        >
          Nebulosa Orión
        </button>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    width: '100vw',
    height: '100vh',
    display: 'grid',
    gridTemplateRows: 'auto auto 1fr',
    gridTemplateColumns: '1fr auto',
    gridTemplateAreas: `
      "header header"
      "search bookmarks"
      "viewer info"
    `,
    background: '#0a0e1a',
    overflow: 'hidden',
  },
  header: {
    gridArea: 'header',
    padding: '20px 32px',
    background: 'linear-gradient(135deg, #1a2332 0%, #0f1419 100%)',
    borderBottom: '2px solid #2a3f5f',
  },
  title: {
    margin: 0,
    fontSize: '28px',
    fontWeight: 700,
    color: '#ffffff',
  },
  subtitle: {
    margin: '4px 0 0 0',
    fontSize: '14px',
    color: '#8b96a5',
  },
  searchBar: {
    gridArea: 'search',
    padding: '16px 32px',
  },
  bookmarks: {
    gridArea: 'bookmarks',
    padding: '16px 32px',
    display: 'flex',
    gap: '8px',
    alignItems: 'center',
  },
  bookmarksTitle: {
    margin: 0,
    marginRight: '12px',
    fontSize: '14px',
    color: '#e0e6ed',
  },
  bookmarkButton: {
    padding: '8px 16px',
    fontSize: '13px',
    background: 'rgba(52, 73, 94, 0.5)',
    border: '1px solid #2a3f5f',
    borderRadius: '6px',
    color: '#e0e6ed',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  viewer: {
    gridArea: 'viewer',
    position: 'relative',
    overflow: 'hidden',
  },
  infoPanel: {
    gridArea: 'info',
    width: '320px',
    padding: '24px',
    background: 'rgba(20, 30, 48, 0.95)',
    borderLeft: '1px solid #2a3f5f',
    overflowY: 'auto',
  },
  infoPanelTitle: {
    margin: '0 0 16px 0',
    fontSize: '18px',
    color: '#ffffff',
  },
  infoPanelContent: {
    fontSize: '14px',
    lineHeight: '1.6',
    color: '#b8c5d6',
  },
  suggestionsTitle: {
    marginTop: '16px',
    marginBottom: '8px',
    fontSize: '14px',
    color: '#ffffff',
  },
  suggestionsList: {
    margin: 0,
    paddingLeft: '20px',
  },
  suggestionItem: {
    marginBottom: '4px',
    fontSize: '13px',
    color: '#8b96a5',
  },
};
