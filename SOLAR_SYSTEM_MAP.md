# 🪐 Mapa Interactivo del Sistema Solar

## Características

### Visualización Interactiva
- **Canvas animado** con órbitas planetarias en tiempo real
- **9 cuerpos celestes**: El Sol + 8 planetas (Mercurio a Neptuno)
- **Fondo espacial** con estrellas generadas proceduralmente
- **Animación de órbitas** con velocidades relativas realistas

### Interactividad
- **Haz clic en cualquier planeta** para ver información detallada
- **Panel de información** con:
  - Emoji del planeta
  - Nombre en español
  - Descripción educativa
  - Dato curioso (fun fact)
  - Diámetro del planeta
  - Distancia al Sol en Unidades Astronómicas (UA)

### Controles
- **🔍 Acercar/Alejar**: Zoom del Sistema Solar (0.5x - 2x)
- **👁️ Mostrar/Ocultar órbitas**: Toggle para las líneas orbitales
- **Leyenda interactiva**: Lista de todos los planetas clickeable

### Integración
- Acceso desde el botón **"🪐 Sistema Solar"** en la esquina inferior izquierda
- No interfiere con el botón "AIT" (esquina superior derecha)
- Botón con animación de brillo (glow effect)

## Datos Educativos

Cada planeta incluye:
- **Descripción**: Información clave sobre el planeta
- **Fun Fact**: Dato curioso e interesante
- **Tamaño relativo**: Visualización proporcional
- **Velocidad orbital**: Animación basada en velocidad real relativa
- **Distancia al Sol**: En Unidades Astronómicas (1 UA = 150 millones de km)

### Ejemplos de Fun Facts
- ☀️ **Sol**: "¡Contiene el 99.86% de la masa total del Sistema Solar!"
- 🪐 **Saturno**: "Es tan ligero que flotaría en el agua"
- 🔵 **Neptuno**: "Los vientos alcanzan velocidades de 2,100 km/h"
- 🟠 **Júpiter**: "La Gran Mancha Roja es una tormenta activa por +350 años"

## Tecnología

- **React + TypeScript**
- **Canvas API** para renderizado 2D
- **RequestAnimationFrame** para animaciones fluidas
- **Responsive design** que se adapta al tamaño de ventana
- **Backdrop filter** para efectos de cristal esmerilado

## Uso

```tsx
import { SolarSystemMap } from '../components/SolarSystemMap';

// En el componente
const [showSolarSystem, setShowSolarSystem] = useState(false);

if (showSolarSystem) {
  return <SolarSystemMap onClose={() => setShowSolarSystem(false)} />;
}

// Botón para activar
<button onClick={() => setShowSolarSystem(true)}>
  🪐 Sistema Solar
</button>
```

## Posición del Botón

El botón "🪐 Sistema Solar" está posicionado en:
- **Posición**: `bottom: 30px, left: 16px`
- **No interfiere** con el botón "AIT" (top-right)
- **zIndex**: 1001 (encima del mapa)
- **Animación**: Efecto de brillo continuo

## Futuras Mejoras

Posibles expansiones:
- [ ] Añadir lunas de los planetas
- [ ] Información sobre asteroides y cometas
- [ ] Modo 3D con WebGL
- [ ] Audio educativo
- [ ] Comparación de tamaños interactiva
- [ ] Quiz educativo
- [ ] Línea de tiempo de exploración espacial

---

**Creado para**: Bug Lightyear - Milky Way Explorer  
**Versión**: 1.0  
**Fecha**: Octubre 2025
