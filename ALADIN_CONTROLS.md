# 🎛️ Controles de Aladin Ocultos

## ✅ Cambios Realizados

### 1. **Configuración de Aladin**
Modificado `client/src/components/AladinSky.tsx`:
- Cambié `showFrame: true` → `showFrame: false`
- Esto oculta el selector de sistemas de coordenadas (ICRS/Galactic/etc.)

### 2. **CSS Adicional**
Actualizado `client/src/styles/GoogleMapsUI.css`:
- Añadido selectores CSS para ocultar controles adicionales
- Oculta botones de frame (ICRS, Galactic)
- Oculta el control de Stack
- Usa `!important` para asegurar que se aplique

### Selectores CSS aplicados:
```css
.aladin-frame-select,
.aladin-coo-div,
.aladin-frame-control,
div[title*="ICRS"],
div[title*="Galactic"],
button[title*="ICRS"],
button[title*="Galactic"],
.aladin-stack-control,
div[title*="Stack"],
button[title*="Stack"],
.aladin-select-box {
  display: none !important;
  visibility: hidden !important;
}
```

## 🎯 Resultado

**Botones Ocultos:**
- ✅ Selector de frame (ICRS/Galactic/etc.)
- ✅ Control de Stack

**Controles Visibles:**
- ✔️ Zoom (+/-)
- ✔️ Fullscreen
- ✔️ Capas (layers)
- ✔️ Retícula
- ✔️ Grid de coordenadas

## 🔄 Para Ver los Cambios

Recarga la página (Ctrl+R o F5) en http://localhost:5173

La interfaz ahora está más limpia, mostrando solo los controles esenciales para la navegación.
