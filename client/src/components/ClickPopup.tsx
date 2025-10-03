/**
 * Pop-up que aparece al hacer clic en el mapa de Aladin
 */

import React, { useEffect } from 'react';

interface ClickPopupProps {
  ra: number;
  dec: number;
  regionName?: string;
  regionDescription?: string;
  regionIcon?: string;
  loading?: boolean;
  onClose: () => void;
}

export const ClickPopup: React.FC<ClickPopupProps> = ({
  ra,
  dec,
  regionName,
  regionDescription,
  regionIcon,
  loading,
  onClose,
}) => {
  // Añadir animación CSS al montar
  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      @keyframes slideInFromBottom {
        from {
          transform: translateY(100%);
          opacity: 0;
        }
        to {
          transform: translateY(0);
          opacity: 1;
        }
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);
  // Convertir coordenadas a formato HMS/DMS
  const formatCoordinates = () => {
    // RA a HMS
    const raHours = ra / 15; // 360° / 24h = 15°/h
    const h = Math.floor(raHours);
    const m = Math.floor((raHours - h) * 60);
    const s = ((raHours - h - m / 60) * 3600).toFixed(2);
    
    // DEC a DMS
    const decSign = dec >= 0 ? '+' : '-';
    const decAbs = Math.abs(dec);
    const d = Math.floor(decAbs);
    const arcm = Math.floor((decAbs - d) * 60);
    const arcs = ((decAbs - d - arcm / 60) * 3600).toFixed(1);
    
    return {
      decimal: `${ra.toFixed(6)}°, ${dec.toFixed(6)}°`,
      hms: `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.padStart(5, '0')}`,
      dms: `${decSign}${d.toString().padStart(2, '0')}:${arcm.toString().padStart(2, '0')}:${arcs.padStart(4, '0')}`,
    };
  };

  const coords = formatCoordinates();

  return (
    <div
      style={styles.popup}
    >
      <div style={styles.header}>
        <h4 style={styles.title}>
          {loading 
            ? 'Identificando región...' 
            : regionName 
              ? `${regionIcon ? regionIcon + ' ' : ''}${regionName}` 
              : 'Coordenadas'}
        </h4>
        <button style={styles.closeButton} onClick={onClose}>
          ×
        </button>
      </div>

      <div style={styles.content}>
        {regionDescription && (
          <div style={styles.description}>
            {regionDescription}
          </div>
        )}

        {regionDescription && <div style={styles.separator} />}

        <div style={styles.field}>
          <span style={styles.label}>RA (decimal):</span>
          <span style={styles.value}>{ra.toFixed(6)}°</span>
        </div>

        <div style={styles.field}>
          <span style={styles.label}>Dec (decimal):</span>
          <span style={styles.value}>{dec.toFixed(6)}°</span>
        </div>

        <div style={styles.separator} />

        <div style={styles.field}>
          <span style={styles.label}>RA (HMS):</span>
          <span style={styles.value}>{coords.hms}</span>
        </div>

        <div style={styles.field}>
          <span style={styles.label}>Dec (DMS):</span>
          <span style={styles.value}>{coords.dms}</span>
        </div>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  popup: {
    position: 'fixed',
    bottom: '20px',
    right: '20px',
    background: 'rgba(15, 23, 42, 0.98)',
    border: '2px solid #3b82f6',
    borderRadius: '12px',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
    minWidth: '320px',
    maxWidth: '400px',
    zIndex: 10000,
    backdropFilter: 'blur(10px)',
    animation: 'slideInFromBottom 0.3s ease-out',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 16px',
    background: 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%)',
    borderTopLeftRadius: '10px',
    borderTopRightRadius: '10px',
  },
  title: {
    margin: 0,
    fontSize: '15px',
    fontWeight: 600,
    color: '#ffffff',
  },
  closeButton: {
    background: 'transparent',
    border: 'none',
    color: '#ffffff',
    fontSize: '20px',
    cursor: 'pointer',
    padding: '0 4px',
    lineHeight: 1,
    opacity: 0.8,
    transition: 'opacity 0.2s',
  },
  content: {
    padding: '16px',
  },
  description: {
    marginBottom: '12px',
    padding: '10px',
    background: 'rgba(59, 130, 246, 0.15)',
    border: '1px solid rgba(59, 130, 246, 0.4)',
    borderRadius: '6px',
    fontSize: '13px',
    color: '#bfdbfe',
    lineHeight: '1.5',
  },
  field: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '8px',
    fontSize: '13px',
  },
  label: {
    color: '#94a3b8',
    fontWeight: 500,
  },
  value: {
    color: '#e2e8f0',
    fontFamily: 'monospace',
    fontWeight: 600,
  },
  separator: {
    height: '1px',
    background: 'rgba(148, 163, 184, 0.3)',
    margin: '12px 0',
  },
};
