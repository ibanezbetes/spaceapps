/**
 * Mapa Interactivo del Sistema Solar
 * Usa la API de NASA Eyes para visualización 3D educativa
 */

import React, { useEffect, useRef, useState } from 'react';
import { AIChat } from './AIChat';

interface SolarSystemMapProps {
  onClose: () => void;
}

interface PlanetInfo {
  id: string;
  name: string;
  emoji: string;
  color: string;
  description: string;
  funFact: string;
  distance: string; // Distancia al Sol en UA (Unidades Astronómicas)
  diameter: string;
  orbitSpeed: number; // Velocidad relativa para animación
  size: number; // Tamaño relativo para visualización
}

export const SolarSystemMap: React.FC<SolarSystemMapProps> = ({ onClose }) => {
  const [selectedPlanet, setSelectedPlanet] = useState<PlanetInfo | null>(null);
  const [scale, setScale] = useState(1);
  const [showOrbits, setShowOrbits] = useState(true);
  const [showChat, setShowChat] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();

  const planets: PlanetInfo[] = [
    {
      id: 'sol',
      name: 'El Sol',
      emoji: '☀️',
      color: '#FDB813',
      description: 'Nuestra estrella, el corazón del Sistema Solar. Genera energía mediante fusión nuclear.',
      funFact: '¡El Sol contiene el 99.86% de la masa total del Sistema Solar!',
      distance: '0 UA',
      diameter: '1,392,000 km',
      orbitSpeed: 0,
      size: 60,
    },
    {
      id: 'mercurio',
      name: 'Mercurio',
      emoji: '🔴',
      color: '#8C7853',
      description: 'El planeta más pequeño y el más cercano al Sol. Su superficie está llena de cráteres.',
      funFact: 'Un año en Mercurio dura solo 88 días terrestres, pero un día dura 59 días terrestres.',
      distance: '0.39 UA',
      diameter: '4,879 km',
      orbitSpeed: 4.74,
      size: 8,
    },
    {
      id: 'venus',
      name: 'Venus',
      emoji: '🟡',
      color: '#FFC649',
      description: 'El planeta más caliente del Sistema Solar debido a su atmósfera de CO₂.',
      funFact: 'Venus gira en dirección opuesta a la mayoría de los planetas (rotación retrógrada).',
      distance: '0.72 UA',
      diameter: '12,104 km',
      orbitSpeed: 3.50,
      size: 14,
    },
    {
      id: 'tierra',
      name: 'La Tierra',
      emoji: '🌍',
      color: '#4A90E2',
      description: 'Nuestro hogar. El único planeta conocido con vida.',
      funFact: '71% de la superficie está cubierta de agua, por eso se ve azul desde el espacio.',
      distance: '1.00 UA',
      diameter: '12,742 km',
      orbitSpeed: 2.98,
      size: 15,
    },
    {
      id: 'marte',
      name: 'Marte',
      emoji: '🔴',
      color: '#E27B58',
      description: 'El planeta rojo. Tiene los volcanes más grandes del Sistema Solar.',
      funFact: 'El Monte Olimpo en Marte es 3 veces más alto que el Monte Everest.',
      distance: '1.52 UA',
      diameter: '6,779 km',
      orbitSpeed: 2.41,
      size: 10,
    },
    {
      id: 'jupiter',
      name: 'Júpiter',
      emoji: '🟠',
      color: '#C88B3A',
      description: 'El gigante gaseoso más grande. Tiene más de 79 lunas conocidas.',
      funFact: 'La Gran Mancha Roja es una tormenta que lleva activa más de 350 años.',
      distance: '5.20 UA',
      diameter: '139,820 km',
      orbitSpeed: 1.31,
      size: 45,
    },
    {
      id: 'saturno',
      name: 'Saturno',
      emoji: '🪐',
      color: '#FAD5A5',
      description: 'Famoso por sus impresionantes anillos hechos de hielo y roca.',
      funFact: 'Saturno es tan ligero que flotaría en el agua (si encontraras un océano lo suficientemente grande).',
      distance: '9.54 UA',
      diameter: '116,460 km',
      orbitSpeed: 0.97,
      size: 38,
    },
    {
      id: 'urano',
      name: 'Urano',
      emoji: '🔵',
      color: '#4FD0E7',
      description: 'Un gigante de hielo que gira de lado. Su eje está inclinado 98 grados.',
      funFact: 'Urano es el planeta más frío del Sistema Solar, con temperaturas de -224°C.',
      distance: '19.19 UA',
      diameter: '50,724 km',
      orbitSpeed: 0.68,
      size: 22,
    },
    {
      id: 'neptuno',
      name: 'Neptuno',
      emoji: '🔵',
      color: '#4169E1',
      description: 'El planeta más lejano. Tiene los vientos más rápidos del Sistema Solar.',
      funFact: 'Los vientos en Neptuno pueden alcanzar velocidades de 2,100 km/h.',
      distance: '30.07 UA',
      diameter: '49,244 km',
      orbitSpeed: 0.54,
      size: 21,
    },
  ];

  // Animación de órbitas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let angle = 0;

    const animate = () => {
      const width = canvas.width;
      const height = canvas.height;
      const centerX = width / 2;
      const centerY = height / 2;

      // Limpiar canvas
      ctx.clearRect(0, 0, width, height);

      // Fondo espacial sin estrellas (más limpio)
      ctx.fillStyle = '#0a0e27';
      ctx.fillRect(0, 0, width, height);

      // Estrellas eliminadas para evitar el efecto parpadeante molesto
      // ctx.fillStyle = 'white';
      // for (let i = 0; i < 200; i++) {
      //   const x = Math.random() * width;
      //   const y = Math.random() * height;
      //   const size = Math.random() * 2;
      //   ctx.fillRect(x, y, size, size);
      // }

      // Dibujar el Sol
      const sun = planets[0];
      ctx.beginPath();
      ctx.arc(centerX, centerY, sun.size * scale, 0, Math.PI * 2);
      ctx.fillStyle = sun.color;
      ctx.shadowBlur = 30;
      ctx.shadowColor = sun.color;
      ctx.fill();
      ctx.shadowBlur = 0;

      // Dibujar órbitas y planetas
      planets.slice(1).forEach((planet, index) => {
        const orbitRadius = (100 + index * 70) * scale;

        // Dibujar órbita
        if (showOrbits) {
          ctx.beginPath();
          ctx.arc(centerX, centerY, orbitRadius, 0, Math.PI * 2);
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
          ctx.lineWidth = 1;
          ctx.stroke();
        }

        // Calcular posición del planeta
        const planetAngle = angle * planet.orbitSpeed;
        const x = centerX + orbitRadius * Math.cos(planetAngle);
        const y = centerY + orbitRadius * Math.sin(planetAngle);

        // Dibujar planeta - SIN círculo de color de fondo
        // ctx.beginPath();
        // ctx.arc(x, y, planet.size * scale, 0, Math.PI * 2);
        // ctx.fillStyle = planet.color;
        // ctx.fill();

        // Dibujar emoji del planeta
        ctx.font = `${planet.size * scale * 1.5}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(planet.emoji, x, y);

        // Dibujar nombre si está seleccionado
        if (selectedPlanet?.id === planet.id) {
          ctx.fillStyle = 'white';
          ctx.font = 'bold 14px Arial';
          ctx.fillText(planet.name, x, y - planet.size * scale - 15);
        }
      });

      angle += 0.001;
      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [scale, showOrbits, selectedPlanet]);

  // Manejar clic en canvas para seleccionar planeta
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    // Revisar si se hizo clic en el Sol
    const sunDistance = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);
    if (sunDistance <= planets[0].size * scale) {
      setSelectedPlanet(planets[0]);
      return;
    }

    // Revisar planetas
    planets.slice(1).forEach((planet, index) => {
      const orbitRadius = (100 + index * 70) * scale;
      const distance = Math.abs(Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2) - orbitRadius);
      
      if (distance <= planet.size * scale) {
        setSelectedPlanet(planet);
      }
    });
  };

  // Ajustar tamaño del canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, []);

  // Manejar zoom con rueda del ratón
  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    
    // deltaY negativo = scroll hacia arriba = zoom in
    // deltaY positivo = scroll hacia abajo = zoom out
    const zoomDelta = e.deltaY > 0 ? -0.1 : 0.1;
    const newScale = Math.max(0.5, Math.min(2, scale + zoomDelta));
    
    setScale(newScale);
  };

  return (
    <div style={styles.container}>
      {/* Canvas del Sistema Solar */}
      <canvas
        ref={canvasRef}
        style={styles.canvas}
        onClick={handleCanvasClick}
        onWheel={handleWheel}
      />

      {/* Título */}
      <div style={styles.header}>
        <h1 style={styles.title}>
          Mapa Interactivo del Sistema Solar
        </h1>
        <p style={styles.subtitle}>
          Haz clic en los planetas para aprender más
        </p>
      </div>

      {/* Controles - OCULTOS */}
      {/* <div style={styles.controls}>
        <button
          style={styles.controlButton}
          onClick={() => setScale(Math.min(scale + 0.2, 2))}
          disabled={scale >= 2}
        >
          🔍+ Acercar
        </button>
        <div style={styles.zoomIndicator}>
          Zoom: {Math.round(scale * 100)}%
        </div>
        <button
          style={styles.controlButton}
          onClick={() => setScale(Math.max(scale - 0.2, 0.5))}
          disabled={scale <= 0.5}
        >
          🔍− Alejar
        </button>
        <button
          style={styles.controlButton}
          onClick={() => setShowOrbits(!showOrbits)}
        >
          {showOrbits ? '👁️ Ocultar órbitas' : '👁️ Mostrar órbitas'}
        </button>
        <button
          style={styles.controlButton}
          onClick={() => setScale(1)}
        >
          🎯 Restablecer
        </button>
      </div> */}

      {/* Información del planeta seleccionado */}
      {selectedPlanet && (
        <div style={styles.infoPanel}>
          <button
            style={styles.closeInfoButton}
            onClick={() => setSelectedPlanet(null)}
          >
            ✕
          </button>
          <div style={styles.planetEmoji}>{selectedPlanet.emoji}</div>
          <h2 style={styles.planetName}>{selectedPlanet.name}</h2>
          <p style={styles.planetDescription}>{selectedPlanet.description}</p>
          
          <div style={styles.planetStats}>
            <div style={styles.stat}>
              <span style={styles.statLabel}>📏 Diámetro:</span>
              <span style={styles.statValue}>{selectedPlanet.diameter}</span>
            </div>
            <div style={styles.stat}>
              <span style={styles.statLabel}>🌟 Distancia al Sol:</span>
              <span style={styles.statValue}>{selectedPlanet.distance}</span>
            </div>
          </div>

          <div style={styles.funFactBox}>
            <div style={styles.funFactIcon}>💡</div>
            <p style={styles.funFact}>{selectedPlanet.funFact}</p>
          </div>

          {/* Botón para abrir chat IA */}
          <button
            style={styles.aiChatButton}
            onClick={() => setShowChat(true)}
          >
            💬 Pregunta a la IA sobre {selectedPlanet.name}
          </button>
        </div>
      )}

      {/* Chat de IA */}
      {showChat && selectedPlanet && (
        <AIChat
          regionName={selectedPlanet.name}
          regionDescription={`${selectedPlanet.description} ${selectedPlanet.funFact}`}
          ra={0}
          dec={0}
          onClose={() => setShowChat(false)}
        />
      )}

      {/* Botón de cerrar */}
      <button style={styles.closeButton} onClick={onClose}>
        ← Volver al Mapa Galáctico
      </button>

      {/* Leyenda de planetas - OCULTA */}
      {/* <div style={styles.legend}>
        <h3 style={styles.legendTitle}>Planetas</h3>
        <div style={styles.legendItems}>
          {planets.map((planet) => (
            <div
              key={planet.id}
              style={{
                ...styles.legendItem,
                ...(selectedPlanet?.id === planet.id ? styles.legendItemActive : {}),
              }}
              onClick={() => setSelectedPlanet(planet)}
            >
              <span style={styles.legendEmoji}>{planet.emoji}</span>
              <span style={styles.legendName}>{planet.name}</span>
            </div>
          ))}
        </div>
      </div> */}
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'linear-gradient(to bottom, #0a0e27 0%, #1a1f3a 100%)',
    overflow: 'hidden',
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
  },
  canvas: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    cursor: 'pointer',
  },
  header: {
    position: 'absolute',
    top: '20px',
    left: '50%',
    transform: 'translateX(-50%)',
    textAlign: 'center',
    zIndex: 10,
    pointerEvents: 'none',
  },
  title: {
    color: 'white',
    fontSize: '32px',
    fontWeight: 'bold',
    margin: '0 0 8px 0',
    textShadow: '0 2px 10px rgba(0,0,0,0.5)',
  },
  subtitle: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: '16px',
    margin: 0,
    textShadow: '0 1px 5px rgba(0,0,0,0.5)',
  },
  controls: {
    position: 'absolute',
    top: '20px',
    left: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    zIndex: 10,
  },
  controlButton: {
    padding: '12px 20px',
    background: 'rgba(255,255,255,0.1)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255,255,255,0.2)',
    borderRadius: '12px',
    color: 'white',
    fontSize: '14px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    fontWeight: '500',
  },
  zoomIndicator: {
    padding: '10px 20px',
    background: 'rgba(244, 114, 182, 0.2)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(244, 114, 182, 0.4)',
    borderRadius: '12px',
    color: 'white',
    fontSize: '13px',
    fontWeight: 'bold',
    textAlign: 'center',
    userSelect: 'none',
  },
  infoPanel: {
    position: 'absolute',
    top: '50%',
    right: '30px',
    transform: 'translateY(-50%)',
    width: '350px',
    maxHeight: '80vh',
    overflowY: 'auto',
    background: 'rgba(20,25,45,0.95)',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '20px',
    padding: '30px',
    zIndex: 15,
    boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
  },
  closeInfoButton: {
    position: 'absolute',
    top: '15px',
    right: '15px',
    background: 'rgba(255,255,255,0.1)',
    border: 'none',
    borderRadius: '50%',
    width: '32px',
    height: '32px',
    color: 'white',
    fontSize: '18px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  planetEmoji: {
    fontSize: '64px',
    textAlign: 'center',
    marginBottom: '20px',
  },
  planetName: {
    color: 'white',
    fontSize: '28px',
    fontWeight: 'bold',
    margin: '0 0 15px 0',
    textAlign: 'center',
  },
  planetDescription: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: '15px',
    lineHeight: '1.6',
    marginBottom: '20px',
  },
  planetStats: {
    background: 'rgba(255,255,255,0.05)',
    borderRadius: '12px',
    padding: '15px',
    marginBottom: '20px',
  },
  stat: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '10px',
  },
  statLabel: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: '14px',
  },
  statValue: {
    color: 'white',
    fontSize: '14px',
    fontWeight: 'bold',
  },
  funFactBox: {
    background: 'linear-gradient(135deg, rgba(244,114,182,0.2) 0%, rgba(168,85,247,0.2) 100%)',
    borderRadius: '12px',
    padding: '15px',
    display: 'flex',
    gap: '12px',
  },
  funFactIcon: {
    fontSize: '24px',
    flexShrink: 0,
  },
  funFact: {
    color: 'white',
    fontSize: '14px',
    lineHeight: '1.6',
    margin: 0,
    fontStyle: 'italic',
  },
  aiChatButton: {
    marginTop: '20px',
    padding: '12px 20px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    border: 'none',
    borderRadius: '12px',
    color: 'white',
    fontSize: '14px',
    fontWeight: 'bold',
    cursor: 'pointer',
    width: '100%',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 12px rgba(102,126,234,0.3)',
  },
  closeButton: {
    position: 'absolute',
    bottom: '30px',
    left: '30px',
    padding: '15px 30px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    border: 'none',
    borderRadius: '12px',
    color: 'white',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
    zIndex: 10,
    boxShadow: '0 4px 15px rgba(102,126,234,0.4)',
    transition: 'all 0.3s ease',
  },
  legend: {
    position: 'absolute',
    bottom: '30px',
    right: '30px',
    background: 'rgba(20,25,45,0.9)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '16px',
    padding: '20px',
    zIndex: 10,
    maxWidth: '200px',
  },
  legendTitle: {
    color: 'white',
    fontSize: '16px',
    fontWeight: 'bold',
    margin: '0 0 15px 0',
  },
  legendItems: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  legendItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '8px 12px',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    background: 'transparent',
  },
  legendItemActive: {
    background: 'rgba(255,255,255,0.1)',
  },
  legendEmoji: {
    fontSize: '20px',
  },
  legendName: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: '13px',
    fontWeight: '500',
  },
};
