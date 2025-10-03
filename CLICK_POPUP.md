# 🖱️ Pop-up Interactivo de Clic en el Mapa

## 📋 Descripción

Cuando haces clic en cualquier punto del mapa de Aladin Lite, aparece un **pop-up flotante** que muestra:

1. **Nombre del objeto** (si existe alguno catalogado cerca)
2. **Tipo de objeto** (nebulosa, estrella, galaxia, cúmulo, etc.)
3. **Coordenadas en formato decimal** (RA, Dec en grados)
4. **Coordenadas en formato sexagesimal** (HMS para RA, DMS para Dec)
5. **Distancia al objeto** (si hay uno cercano)

---

## 🎯 Funcionalidad

### Caso 1: Click en un objeto conocido
```
Usuario: *Click en M42*
Popup muestra:
  📍 M 42
  Tipo: HII (2.3' de distancia)
  RA (decimal): 83.818662°
  Dec (decimal): -5.389679°
  RA (HMS): 05:35:16.4
  Dec (DMS): -05:23:22.8
```

### Caso 2: Click en espacio vacío
```
Usuario: *Click en coordenadas sin objeto*
Popup muestra:
  📍 Coordenadas
  RA (decimal): 123.456789°
  Dec (decimal): -45.678901°
  RA (HMS): 08:13:49.63
  Dec (DMS): -45:40:44.0
  ℹ️ No se encontró ningún objeto catalogado en esta posición
```

---

## 🔧 Implementación Técnica

### Frontend: `ClickPopup.tsx`

Componente React que renderiza el pop-up flotante:

- **Posición**: Se posiciona donde hiciste clic (usando coordenadas del mouse)
- **Conversión de coordenadas**: Convierte automáticamente entre decimal y sexagesimal
- **Estados**: Loading, con objeto, sin objeto
- **Estilo**: Diseño moderno con backdrop blur y gradiente

```tsx
<ClickPopup
  ra={clickRa}
  dec={clickDec}
  objectName="M 42"
  objectType="HII (2.3' de distancia)"
  loading={false}
  position={{ x: mouseX, y: mouseY }}
  onClose={() => setClickPopup(null)}
/>
```

### Backend: `/api/search/nearby`

Endpoint que busca objetos cercanos usando SIMBAD TAP:

**Request:**
```
GET /api/search/nearby?ra=83.818&dec=-5.389&radius=5
```

**Parámetros:**
- `ra`: Right Ascension en grados
- `dec`: Declination en grados
- `radius`: Radio de búsqueda en arcmin (por defecto 5')

**Response (objeto encontrado):**
```json
{
  "found": true,
  "name": "M 42",
  "type": "HII",
  "ra": 83.818662,
  "dec": -5.389679,
  "distance_arcmin": 2.3
}
```

**Response (no encontrado):**
```json
{
  "found": false,
  "ra": 83.818,
  "dec": -5.389
}
```

### Query ADQL a SIMBAD TAP

```sql
SELECT TOP 1
  main_id as name,
  otype_txt as type,
  ra,
  dec,
  DISTANCE(
    POINT('ICRS', ${ra}, ${dec}),
    POINT('ICRS', ra, dec)
  ) as distance_deg
FROM basic
WHERE 1=CONTAINS(
  POINT('ICRS', ra, dec),
  CIRCLE('ICRS', ${ra}, ${dec}, ${radius / 60.0})
)
ORDER BY distance_deg ASC
```

---

## 📐 Conversión de Coordenadas

### RA (Right Ascension): Grados → HMS

```typescript
const raHours = ra / 15; // 360° / 24h = 15°/h
const h = Math.floor(raHours);
const m = Math.floor((raHours - h) * 60);
const s = ((raHours - h - m / 60) * 3600).toFixed(2);

// Resultado: "05:35:16.48"
```

### Dec (Declination): Grados → DMS

```typescript
const decSign = dec >= 0 ? '+' : '-';
const decAbs = Math.abs(dec);
const d = Math.floor(decAbs);
const arcm = Math.floor((decAbs - d) * 60);
const arcs = ((decAbs - d - arcm / 60) * 3600).toFixed(1);

// Resultado: "-05:23:22.8"
```

---

## 🎨 Diseño del Pop-up

### Estilo Visual

- **Fondo**: `rgba(15, 23, 42, 0.98)` con backdrop-filter blur
- **Borde**: 2px solid `#3b82f6` (azul)
- **Header**: Gradiente azul (`#1e3a8a` → `#1e40af`)
- **Posición**: Centrado horizontalmente sobre el punto de clic
- **Sombra**: `0 8px 32px rgba(0, 0, 0, 0.5)`
- **z-index**: 10000 (siempre visible)

### Animación

- Transform: `translate(-50%, -100%) translateY(-20px)`
  - `-50%`: Centrado horizontal
  - `-100%`: Posicionado arriba del cursor
  - `translateY(-20px)`: Separación de 20px del cursor

---

## 🔍 Flujo de Usuario

1. **Usuario hace clic** en el mapa de Aladin
2. **Aparece popup** con estado "🔍 Buscando objeto..."
3. **Backend consulta** SIMBAD TAP (radio 5 arcmin)
4. **Si encuentra objeto**:
   - Actualiza popup con nombre y tipo
   - Muestra distancia en arcmin
5. **Si NO encuentra**:
   - Muestra solo coordenadas
   - Mensaje: "ℹ️ No se encontró ningún objeto catalogado"
6. **Usuario cierra** con botón ✕

---

## 📊 Rendimiento

- **Timeout**: 8 segundos para query SIMBAD
- **Caché**: No se cachea (cada clic es único)
- **Radio búsqueda**: 5 arcmin (equilibrio entre precisión y cobertura)

### ¿Por qué 5 arcmin?

- 1 arcmin = tamaño aproximado de la Luna llena
- 5 arcmin = área razonable para "cerca"
- Suficiente para capturar objetos grandes (M42 = ~85' de diámetro)
- No tan grande como para confundir objetos distantes

---

## 🧪 Pruebas

### Test 1: Click en M42
```bash
# Backend
curl "http://localhost:3000/api/search/nearby?ra=83.82&dec=-5.39&radius=5"

# Resultado esperado:
{
  "found": true,
  "name": "M 42",
  "type": "HII",
  "distance_arcmin": 0.5
}
```

### Test 2: Click en espacio vacío
```bash
curl "http://localhost:3000/api/search/nearby?ra=0&dec=0&radius=5"

# Resultado esperado:
{
  "found": false,
  "ra": 0,
  "dec": 0
}
```

### Test 3: Click en Betelgeuse
```bash
curl "http://localhost:3000/api/search/nearby?ra=88.79&dec=7.41&radius=5"

# Resultado esperado:
{
  "found": true,
  "name": "* alf Ori",
  "type": "s*r",
  "distance_arcmin": 0.2
}
```

---

## 🚀 Uso

### En la aplicación:

1. Abre el Milky Way Explorer
2. Navega a cualquier región del cielo
3. Haz clic en cualquier punto
4. Observa el popup con información
5. Cierra con el botón ✕ o haz clic en otro lugar

### Casos de uso:

- ✅ **Exploración**: Descubre qué objetos hay en una región
- ✅ **Verificación**: Confirma coordenadas de un objeto
- ✅ **Aprendizaje**: Aprende nombres y tipos de objetos
- ✅ **Navegación**: Obtén coordenadas exactas para otros usos

---

## 🔮 Mejoras Futuras

1. **Más información**: Magnitud, distancia, velocidad radial
2. **Mini imagen**: Thumbnail del objeto desde DSS
3. **Botón "Ir al objeto"**: Centrar y hacer zoom
4. **Historial**: Lista de últimos clicks
5. **Exportar**: Copiar coordenadas al portapapeles
6. **Enlaces**: Link a SIMBAD, Wikipedia, papers

---

## 📚 Referencias

- [SIMBAD TAP Service](http://simbad.u-strasbg.fr/simbad/sim-tap)
- [ADQL Language Reference](https://www.ivoa.net/documents/ADQL/)
- [Aladin Lite v3 Click Events](https://aladin.cds.unistra.fr/AladinLite/doc/)
- [Coordinate Systems (ICRS)](https://en.wikipedia.org/wiki/International_Celestial_Reference_System)

---

**¡Ahora puedes explorar el cielo con un simple clic!** 🌌✨
