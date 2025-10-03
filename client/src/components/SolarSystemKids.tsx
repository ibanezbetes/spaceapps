/**
 * Vista del Sistema Solar para niños
 * Educativa y con información básica
 */

import React, { useState } from 'react';

interface CelestialBody {
  id: string;
  name: string;
  emoji: string;
  color: string;
  description: string;
  funFact: string;
  distance: string; // Distancia al Sol
  size: string;
}

const solarSystemBodies: CelestialBody[] = [
  {
    id: 'sol',
    name: 'El Sol',
    emoji: '☀️',
    color: '#FDB813',
    description: '¡Es nuestra estrella! El Sol es una bola gigante de fuego que nos da luz y calor.',
    funFact: '¡El Sol es tan grande que cabrían 1.3 millones de Tierras dentro!',
    distance: 'Centro del Sistema Solar',
    size: '1,392,000 km de diámetro'
  },
  {
    id: 'mercurio',
    name: 'Mercurio',
    emoji: '🪨',
    color: '#8C7853',
    description: 'Es el planeta más pequeño y el más cercano al Sol. ¡Hace mucho calor de día y mucho frío de noche!',
    funFact: 'Un año en Mercurio dura solo 88 días de la Tierra.',
    distance: '58 millones de km del Sol',
    size: '4,879 km de diámetro'
  },
  {
    id: 'venus',
    name: 'Venus',
    emoji: '🌕',
    color: '#FFC649',
    description: 'Es el planeta más brillante del cielo. Está cubierto de nubes espesas y es muy caliente.',
    funFact: '¡Venus gira al revés! El Sol sale por el oeste y se pone por el este.',
    distance: '108 millones de km del Sol',
    size: '12,104 km de diámetro'
  },
  {
    id: 'tierra',
    name: 'La Tierra',
    emoji: '🌍',
    color: '#4A90E2',
    description: '¡Nuestro hogar! Es el único planeta donde sabemos que hay vida. Tiene agua, aire y muchos seres vivos.',
    funFact: 'La Tierra es el único planeta que no lleva nombre de un dios griego o romano.',
    distance: '150 millones de km del Sol',
    size: '12,742 km de diámetro'
  },
  {
    id: 'luna',
    name: 'La Luna',
    emoji: '🌙',
    color: '#C0C0C0',
    description: 'Es el único satélite natural de la Tierra. ¡Por eso la vemos brillar en la noche!',
    funFact: 'Los astronautas han dejado sus huellas en la Luna, ¡y todavía están ahí!',
    distance: '384,400 km de la Tierra',
    size: '3,474 km de diámetro'
  },
  {
    id: 'marte',
    name: 'Marte',
    emoji: '🔴',
    color: '#CD5C5C',
    description: 'El planeta rojo. Tiene montañas gigantes y un cielo rosado. ¡Los robots exploradores están investigándolo!',
    funFact: 'Marte tiene el volcán más grande del Sistema Solar: el Monte Olimpo.',
    distance: '228 millones de km del Sol',
    size: '6,779 km de diámetro'
  },
  {
    id: 'jupiter',
    name: 'Júpiter',
    emoji: '🟠',
    color: '#C88B3A',
    description: '¡Es el planeta más grande! Tiene una gran mancha roja que es una tormenta gigante.',
    funFact: 'Júpiter es tan grande que todos los demás planetas cabrían dentro de él.',
    distance: '778 millones de km del Sol',
    size: '139,820 km de diámetro'
  },
  {
    id: 'saturno',
    name: 'Saturno',
    emoji: '🪐',
    color: '#FAD5A5',
    description: '¡El planeta de los anillos! Tiene miles de anillos hechos de hielo y rocas.',
    funFact: 'Si pudieras poner a Saturno en un océano gigante, ¡flotaría!',
    distance: '1,429 millones de km del Sol',
    size: '116,460 km de diámetro'
  },
  {
    id: 'urano',
    name: 'Urano',
    emoji: '🔵',
    color: '#4FD0E7',
    description: 'Es un planeta de color azul verdoso. ¡Está inclinado de lado!',
    funFact: 'Urano gira de lado, como una pelota rodando.',
    distance: '2,871 millones de km del Sol',
    size: '50,724 km de diámetro'
  },
  {
    id: 'neptuno',
    name: 'Neptuno',
    emoji: '💙',
    color: '#4169E1',
    description: 'El planeta más lejano. Es azul y tiene vientos muy fuertes.',
    funFact: '¡En Neptuno los vientos pueden soplar a 2,000 km por hora!',
    distance: '4,495 millones de km del Sol',
    size: '49,244 km de diámetro'
  }
];

interface Props {
  onClose: () => void;
}

export const SolarSystemKids: React.FC<Props> = ({ onClose }) => {
  const [selectedBody, setSelectedBody] = useState<CelestialBody | null>(null);

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.titleContainer}>
          <span style={styles.emoji}>🚀</span>
          <h1 style={styles.title}>¡Exploremos el Sistema Solar!</h1>
          <span style={styles.emoji}>✨</span>
        </div>
        <button style={styles.closeButton} onClick={onClose}>
          ← Volver al Mapa
        </button>
      </div>

      {/* Sistema Solar */}
      <div style={styles.solarSystem}>
        <div style={styles.instruction}>
          👆 ¡Haz clic en cada planeta para descubrir cosas increíbles!
        </div>

        <div style={styles.planetsContainer}>
          {solarSystemBodies.map((body, index) => (
            <div
              key={body.id}
              style={{
                ...styles.planetWrapper,
                animationDelay: `${index * 0.1}s`,
              }}
              onClick={() => setSelectedBody(body)}
            >
              <div
                style={{
                  ...styles.planet,
                  backgroundColor: body.color,
                  boxShadow: `0 0 30px ${body.color}80`,
                }}
              >
                <span style={styles.planetEmoji}>{body.emoji}</span>
              </div>
              <div style={styles.planetName}>{body.name}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Popup de información */}
      {selectedBody && (
        <div style={styles.overlay} onClick={() => setSelectedBody(null)}>
          <div style={styles.popup} onClick={(e) => e.stopPropagation()}>
            <div style={{ ...styles.popupHeader, backgroundColor: selectedBody.color }}>
              <span style={styles.popupEmoji}>{selectedBody.emoji}</span>
              <h2 style={styles.popupTitle}>{selectedBody.name}</h2>
              <button
                style={styles.popupClose}
                onClick={() => setSelectedBody(null)}
              >
                ×
              </button>
            </div>

            <div style={styles.popupContent}>
              <div style={styles.section}>
                <h3 style={styles.sectionTitle}>📖 ¿Qué es?</h3>
                <p style={styles.description}>{selectedBody.description}</p>
              </div>

              <div style={styles.section}>
                <h3 style={styles.sectionTitle}>🎉 ¡Dato Curioso!</h3>
                <p style={styles.funFact}>{selectedBody.funFact}</p>
              </div>

              <div style={styles.infoGrid}>
                <div style={styles.infoCard}>
                  <div style={styles.infoLabel}>📏 Tamaño</div>
                  <div style={styles.infoValue}>{selectedBody.size}</div>
                </div>
                <div style={styles.infoCard}>
                  <div style={styles.infoLabel}>🛰️ Distancia</div>
                  <div style={styles.infoValue}>{selectedBody.distance}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
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
    background: 'linear-gradient(to bottom, #0a0e27 0%, #1a1a3e 50%, #2d1b4e 100%)',
    overflow: 'auto',
    zIndex: 100000,
  },
  header: {
    padding: '20px',
    background: 'rgba(15, 23, 42, 0.9)',
    backdropFilter: 'blur(10px)',
    borderBottom: '2px solid #3b82f6',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    position: 'sticky',
    top: 0,
    zIndex: 10,
  },
  titleContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
  },
  title: {
    margin: 0,
    fontSize: '28px',
    fontWeight: 'bold',
    background: 'linear-gradient(45deg, #60a5fa, #a78bfa, #f472b6)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
  },
  emoji: {
    fontSize: '32px',
    animation: 'bounce 2s infinite',
  },
  closeButton: {
    padding: '12px 24px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    border: 'none',
    borderRadius: '8px',
    color: 'white',
    fontSize: '16px',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'transform 0.2s, box-shadow 0.2s',
  },
  solarSystem: {
    padding: '40px 20px',
    maxWidth: '1400px',
    margin: '0 auto',
  },
  instruction: {
    textAlign: 'center',
    fontSize: '20px',
    color: '#fbbf24',
    marginBottom: '40px',
    fontWeight: 600,
    animation: 'pulse 2s infinite',
  },
  planetsContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
    gap: '30px',
    padding: '20px',
  },
  planetWrapper: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '15px',
    cursor: 'pointer',
    transition: 'transform 0.3s',
    animation: 'fadeInUp 0.5s ease-out',
  },
  planet: {
    width: '120px',
    height: '120px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'transform 0.3s, box-shadow 0.3s',
    border: '3px solid rgba(255, 255, 255, 0.3)',
  },
  planetEmoji: {
    fontSize: '48px',
  },
  planetName: {
    color: 'white',
    fontSize: '18px',
    fontWeight: 600,
    textAlign: 'center',
  },
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.8)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100001,
    padding: '20px',
    animation: 'fadeIn 0.3s',
  },
  popup: {
    background: 'rgba(15, 23, 42, 0.98)',
    borderRadius: '20px',
    maxWidth: '600px',
    width: '100%',
    maxHeight: '80vh',
    overflow: 'auto',
    border: '3px solid #3b82f6',
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
    animation: 'scaleIn 0.3s ease-out',
  },
  popupHeader: {
    padding: '25px',
    borderTopLeftRadius: '17px',
    borderTopRightRadius: '17px',
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
    position: 'relative',
  },
  popupEmoji: {
    fontSize: '48px',
  },
  popupTitle: {
    margin: 0,
    color: 'white',
    fontSize: '32px',
    fontWeight: 'bold',
    flex: 1,
  },
  popupClose: {
    background: 'rgba(255, 255, 255, 0.2)',
    border: 'none',
    color: 'white',
    fontSize: '32px',
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'background 0.2s',
  },
  popupContent: {
    padding: '30px',
  },
  section: {
    marginBottom: '25px',
  },
  sectionTitle: {
    color: '#60a5fa',
    fontSize: '20px',
    marginBottom: '12px',
    fontWeight: 600,
  },
  description: {
    color: '#e2e8f0',
    fontSize: '18px',
    lineHeight: '1.6',
    margin: 0,
  },
  funFact: {
    color: '#fbbf24',
    fontSize: '18px',
    lineHeight: '1.6',
    margin: 0,
    fontWeight: 500,
  },
  infoGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '15px',
    marginTop: '25px',
  },
  infoCard: {
    background: 'rgba(59, 130, 246, 0.15)',
    padding: '20px',
    borderRadius: '12px',
    border: '1px solid rgba(59, 130, 246, 0.3)',
  },
  infoLabel: {
    color: '#94a3b8',
    fontSize: '14px',
    marginBottom: '8px',
  },
  infoValue: {
    color: 'white',
    fontSize: '16px',
    fontWeight: 600,
  },
};
