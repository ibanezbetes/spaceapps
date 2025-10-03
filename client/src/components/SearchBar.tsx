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
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ej: M42, Betelgeuse, Crab Nebula, 17:45:40 -28:56:10..."
          style={styles.input}
          disabled={loading}
        />
        <button type="submit" style={styles.button} disabled={loading}>
          {loading ? '🔍...' : '🔍 Buscar'}
        </button>
        <button 
          type="button" 
          style={styles.helpButton} 
          onClick={() => setShowHelp(!showHelp)}
          title="Ver ejemplos de búsqueda"
        >
          ❓
        </button>
      </form>
      {error && <div style={styles.error}>{error}</div>}
      {success && <div style={styles.success}>{success}</div>}
      
      {showHelp && (
        <div style={styles.helpPanel}>
          <h4 style={styles.helpTitle}>💡 Ejemplos de Búsqueda</h4>
          <div style={styles.helpContent}>
            <p><strong>🌟 Nebulosas:</strong> M42, Crab Nebula, Eagle Nebula</p>
            <p><strong>⭐ Estrellas:</strong> Betelgeuse, Sirius, Vega, Rigel</p>
            <p><strong>✨ Cúmulos:</strong> Pleiades, M13, M22</p>
            <p><strong>🌌 Galaxias:</strong> M31, M51, Andromeda Galaxy</p>
            <p><strong>🌍 Sistema Solar:</strong> Sistema Solar, Sol, Tierra, Luna</p>
            <p><strong>📍 Coordenadas:</strong> 17:45:40 -28:56:10</p>
            <p style={styles.helpNote}>
              ℹ️ <strong>Nota:</strong> Los términos del Sistema Solar redirigen a objetos educativos relacionados 
              (formación planetaria, contexto galáctico, cúmulos estelares).
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    padding: '16px',
    background: 'rgba(20, 30, 48, 0.95)',
    borderRadius: '8px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
  },
  form: {
    display: 'flex',
    gap: '8px',
  },
  input: {
    flex: 1,
    padding: '12px 16px',
    fontSize: '14px',
    background: '#0a0e1a',
    border: '1px solid #2a3f5f',
    borderRadius: '6px',
    color: '#e0e6ed',
    outline: 'none',
  },
  button: {
    padding: '12px 24px',
    fontSize: '14px',
    fontWeight: 600,
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    border: 'none',
    borderRadius: '6px',
    color: 'white',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  helpButton: {
    padding: '12px 16px',
    fontSize: '16px',
    background: 'rgba(255, 255, 255, 0.1)',
    border: '1px solid #2a3f5f',
    borderRadius: '6px',
    color: '#e0e6ed',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  error: {
    marginTop: '8px',
    padding: '8px 12px',
    background: 'rgba(231, 76, 60, 0.2)',
    border: '1px solid rgba(231, 76, 60, 0.5)',
    borderRadius: '4px',
    color: '#e74c3c',
    fontSize: '13px',
  },
  success: {
    marginTop: '8px',
    padding: '8px 12px',
    background: 'rgba(46, 204, 113, 0.2)',
    border: '1px solid rgba(46, 204, 113, 0.5)',
    borderRadius: '4px',
    color: '#2ecc71',
    fontSize: '13px',
  },
  helpPanel: {
    marginTop: '12px',
    padding: '16px',
    background: 'rgba(30, 40, 60, 0.95)',
    border: '1px solid #2a3f5f',
    borderRadius: '6px',
  },
  helpTitle: {
    margin: '0 0 12px 0',
    color: '#667eea',
    fontSize: '15px',
    fontWeight: 600,
  },
  helpContent: {
    fontSize: '13px',
    color: '#b8c5d6',
    lineHeight: '1.6',
  },
  helpNote: {
    marginTop: '12px',
    paddingTop: '12px',
    borderTop: '1px solid #2a3f5f',
    color: '#ffa726',
    fontSize: '12px',
  },
};
