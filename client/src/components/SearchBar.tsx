/**
 * Barra de búsqueda unificada
 */

import React, { useState } from 'react';
import axios from 'axios';

interface SearchBarProps {
  onSearch: (result: any) => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({ onSearch }) => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showHelp, setShowHelp] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!query.trim()) {
      setError('Por favor ingresa algo para buscar');
      return;
    }

    console.log('[SearchBar] Buscando:', query);
    setLoading(true);
    setError('');

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      console.log('[SearchBar] API URL:', apiUrl);
      
      const response = await axios.get(`${apiUrl}/api/search`, {
        params: { q: query },
      });

      console.log('[SearchBar] Respuesta recibida:', response.data);
      onSearch(response.data);
      setSuccess('✓ Búsqueda exitosa');
      setError(''); // Limpiar error en caso de éxito
      
      // Limpiar mensaje de éxito después de 3 segundos
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || err.message || 'Error al buscar';
      setError(errorMsg);
      setSuccess('');
      console.error('[SearchBar] ERROR:', err);
      console.error('[SearchBar] Error details:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <form onSubmit={handleSearch} style={styles.form}>
        <input
          type="text"
          className="search-input"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar en Bug Lightyear..."
          style={styles.input}
          disabled={loading}
        />

        <button 
          type="submit" 
          className="search-button"
          style={styles.button} 
          disabled={loading}
        >
          {loading ? '...' : '🔍'}
        </button>
      </form>
      
      {showHelp && (
        <div style={styles.helpPanel}>
          <h4 style={styles.helpTitle}>Ejemplos de Búsqueda</h4>
          <div style={styles.helpContent}>
            <p><strong>Nebulosas:</strong> M42, Crab Nebula, Eagle Nebula</p>
            <p><strong>Estrellas:</strong> Betelgeuse, Sirius, Vega, Rigel</p>
            <p><strong>Cúmulos:</strong> Pleiades, M13, M22</p>
            <p><strong>Galaxias:</strong> M31, M51, Andromeda Galaxy</p>
            <p><strong>Sistema Solar:</strong> Sistema Solar, Sol, Tierra, Luna</p>
            <p><strong>Coordenadas:</strong> 17:45:40 -28:56:10</p>
            <p style={styles.helpNote}>
              <strong>Nota:</strong> Los términos del Sistema Solar redirigen a objetos educativos relacionados 
              (formación planetaria, contexto galáctico, cúmulos estelares).
            </p>
          </div>
        </div>
      )}
      
      {error && <div style={styles.error}>{error}</div>}
      {success && <div style={styles.success}>{success}</div>}
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    width: '100%',
  },
  form: {
    display: 'flex',
    gap: '0',
    alignItems: 'center',
    width: '100%',
  },
  input: {
    flex: 1,
    padding: '14px 20px',
    fontSize: '15px',
    background: 'transparent',
    border: 'none',
    color: '#e0e6ed',
    outline: 'none',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  button: {
    padding: '10px 20px',
    fontSize: '14px',
    fontWeight: 500,
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    border: 'none',
    borderRadius: '4px',
    color: 'white',
    cursor: 'pointer',
    transition: 'background 0.2s',
    marginRight: '8px',
  },
  helpButton: {
    padding: '8px 12px',
    fontSize: '18px',
    background: 'transparent',
    border: 'none',
    color: '#8b96a5',
    cursor: 'pointer',
    transition: 'all 0.2s',
    marginRight: '4px',
  },
  error: {
    marginTop: '8px',
    padding: '12px 16px',
    background: 'rgba(231, 76, 60, 0.2)',
    borderLeft: '4px solid #e74c3c',
    borderRadius: '4px',
    color: '#ff6b6b',
    fontSize: '13px',
    fontWeight: 500,
  },
  success: {
    marginTop: '8px',
    padding: '12px 16px',
    background: 'rgba(46, 204, 113, 0.2)',
    borderLeft: '4px solid #2ecc71',
    borderRadius: '4px',
    color: '#51cf66',
    fontSize: '13px',
    fontWeight: 500,
  },
  helpPanel: {
    position: 'absolute',
    top: 'calc(100% + 8px)',
    left: 0,
    right: 0,
    padding: '20px',
    background: 'rgba(30, 30, 30, 0.95)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '8px',
    boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
    backdropFilter: 'blur(10px)',
    zIndex: 10,
  },
  helpTitle: {
    margin: '0 0 16px 0',
    color: '#e0e6ed',
    fontSize: '16px',
    fontWeight: 600,
  },
  helpContent: {
    fontSize: '13px',
    color: '#b8c5d6',
    lineHeight: '1.8',
  },
  helpNote: {
    marginTop: '12px',
    paddingTop: '12px',
    borderTop: '1px solid rgba(255, 255, 255, 0.1)',
    color: '#ffa726',
    fontSize: '12px',
    fontStyle: 'italic',
  },
};
