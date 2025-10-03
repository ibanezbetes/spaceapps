# Milky Way Explorer

Explorador interactivo de la Vía Láctea usando datos oficiales de NASA/IPAC (IRSA) y NASA/GSFC (SkyView).

## 🌌 Características

- **Búsqueda Unificada**: Por coordenadas (RA/Dec), nombres de objetos, o texto libre
- **Visualización Multibanda**: Overlays de IR (WISE, 2MASS), óptico (DSS2), UV (GALEX), radio (NVSS)
- **Catálogos On-Demand**: AllWISE, 2MASS PSC por búsqueda de cono
- **Cutouts Dinámicos**: Recortes de imagen sin descargar terabytes
- **Visor Astronómico**: Aladin Lite v3 integrado

## 🚀 Quick Start

```bash
# Backend
npm install
cp .env.example .env
npm run dev  # → http://localhost:3000

# Frontend (nueva terminal)
cd client
npm install
npm run dev  # → http://localhost:5173
```

Abre http://localhost:5173

## 🔍 Ejemplos de Búsqueda

```
# Coordenadas
17:45:40 -28:56:10
266.41683 -29.00781

# Nombres de objetos
Cygnus X
NGC 7000
M31

# Texto libre
polvo interestelar brillante
regiones HII
centro galáctico
```

## 📡 Endpoints Backend

### Búsqueda Unificada
```
GET /api/search?q=17:45:40 -28:56:10
GET /api/search?q=Cygnus X
GET /api/search?q=polvo IR brillante
```

**Respuesta:**
```json
{
  "type": "coords",
  "ra": 266.41683,
  "dec": -29.00781,
  "fov": 4,
  "suggestions": [
    {
      "id": "wise_w3",
      "survey": "WISE 12 micron",
      "service": "skyview",
      "band": "IR",
      "wavelength_um": 12
    }
  ],
  "note": "Centro Galáctico"
}
```

### Recortes de Imagen (Cutouts)

**SkyView (NASA/GSFC):**
```
GET /api/cutout/skyview?ra=266.41683&dec=-29.00781&size=4&survey=DSS2 Red
```

**IRSA (NASA/IPAC):**
```
GET /api/cutout/irsa?ra=83.82208&dec=-5.39111&size=0.5&survey=wise_3band
```

### Catálogos por Cono

**Simple Cone Search (SCS):**
```
GET /api/catalogs/cone?ra=83.82&dec=-5.39&radius=0.2&table=allwise_p3as_psd
```

**Respuesta:**
```json
{
  "sources": [
    {
      "designation": "J055317.36-052326.0",
      "ra": 83.3223,
      "dec": -5.3906,
      "w1mpro": 8.234,
      "w2mpro": 7.891
    }
  ],
  "count": 142,
  "table": "allwise_p3as_psd"
}
```

### TAP Genérico (ADQL)

```
POST /api/catalogs/tap
Content-Type: application/json

{
  "adql": "SELECT ra,dec,designation,j_m,h_m,k_m FROM fp_psc WHERE CONTAINS(POINT('ICRS',ra,dec),CIRCLE('ICRS',83.82,-5.39,0.3))=1 FETCH FIRST 200 ROWS ONLY"
}
```

## 🗂️ Estructura del Proyecto

```
/
├── src/
│   └── server/              # Backend Express
│       ├── routes/
│       │   ├── search.ts    # Búsqueda unificada
│       │   ├── cutouts.ts   # IRSA & SkyView cutouts
│       │   └── catalogs.ts  # SCS & TAP
│       ├── data/
│       │   └── layers.json  # Metadatos de surveys
│       ├── utils/
│       │   ├── coords.ts    # Parser RA/Dec
│       │   └── cache.ts     # LRU cache
│       └── server.ts
│
├── client/                  # Frontend React + Vite
│   ├── src/
│   │   ├── components/
│   │   │   ├── AladinSky.tsx      # Visor Aladin Lite v3
│   │   │   ├── SearchBar.tsx      # Búsqueda unificada
│   │   │   ├── LayerPanel.tsx     # Panel de capas
│   │   │   ├── CatalogList.tsx    # Lista de catálogos
│   │   │   └── Inspector.tsx      # Inspector de clic
│   │   ├── pages/
│   │   │   ├── Home.tsx
│   │   │   └── MilkyWay.tsx       # Página principal
│   │   └── main.tsx
│   └── index.html           # CDN Aladin Lite v3
│
└── README.md
```

## 🛠️ Tecnologías

### Backend
- **Node.js + Express**: API REST
- **Axios**: Proxy a IRSA/SkyView
- **LRU Cache**: Cache en memoria (256 entradas)
- **Zod**: Validación de queries
- **Morgan**: Logging HTTP

### Frontend
- **React 18 + TypeScript**
- **Vite**: Build tool
- **Aladin Lite v3**: Visor astronómico
- **React Router**: Navegación

## 📊 Surveys Disponibles

### Infrarrojo (IR)
- **WISE**: W1 (3.4µm), W2 (4.6µm), W3 (12µm), W4 (22µm)
- **2MASS**: J (1.25µm), H (1.65µm), Ks (2.17µm)

### Óptico
- **DSS2**: Red, Blue, IR

### Ultravioleta (UV)
- **GALEX**: FUV (0.15µm), NUV (0.23µm)

### Radio
- **NVSS**: 1.4 GHz
- **408 MHz**: All-sky

Ver lista completa: https://skyview.gsfc.nasa.gov/current/cgi/survey.pl

## 🔧 Configuración

### Variables de Entorno (.env)

```env
PORT=3000
NODE_ENV=development

# Cache
CACHE_MAX_SIZE=256
CACHE_TTL_MS=900000

# Límites de queries
MAX_CUTOUT_SIZE_DEG=10
MAX_CUTOUT_PIXELS=2048
MAX_CONE_RADIUS_DEG=5

# Timeouts
IRSA_TIMEOUT_MS=30000
SKYVIEW_TIMEOUT_MS=30000

# Logging
LOG_LEVEL=info
```

## 📚 APIs Oficiales Usadas

1. **IRSA Image Cutouts**: https://irsa.ipac.caltech.edu/docs/program_interface/imageserver.html
2. **IRSA SCS**: https://irsa.ipac.caltech.edu/docs/program_interface/scs.html
3. **IRSA TAP**: https://irsa.ipac.caltech.edu/docs/program_interface/tap.html
4. **NASA SkyView**: https://skyview.gsfc.nasa.gov/current/help/index.html

## 🎯 Definition of Done (Demo)

- [x] Buscar "17:45:40 -28:56:10" → centra visor con FOV 4-6°
- [x] Buscar "Cygnus X" → resuelve nombre vía SCS/TAP
- [x] Toggle "WISE 3.4µm" → carga recorte con opacidad ajustable
- [x] "Fuentes cercanas (AllWISE)" → pinta 100+ marcadores
- [x] Inspector al clic → muestra RA/Dec y enlaces a IRSA/SkyView
- [x] Bookmarks: Centro Galáctico, Cygnus X, Orión

## 🔬 Ejemplos de Uso

### 1. Explorar Centro Galáctico
```
Búsqueda: 17:45:40 -28:56:10
Capas: WISE W3 + 2MASS Ks + DSS2 Red
Catálogo: AllWISE (radio 0.5°)
```

### 2. Buscar Regiones HII
```
Búsqueda: "regiones HII brillantes"
Sugerencias: GALEX FUV, WISE W1, DSS2
```

### 3. Nebulosa de Orión
```
Búsqueda: M42
Catálogo: 2MASS PSC (radio 0.3°)
Overlay: WISE W4 (polvo cálido)
```

## 📝 Notas Técnicas

### Cutouts vs Full Mosaicos
Este proyecto usa **cutouts on-demand** (recortes) en lugar de descargar mosaicos completos. Cada recorte es típicamente <10 MB vs terabytes de datos.

### Formatos Soportados
- **FITS**: Astronomical standard (con WCS headers)
- **PNG/JPEG**: Quicklook images
- **VOTable/CSV**: Catálogos tabulares

### Cache Strategy
- **LRU**: 256 entradas por defecto
- **TTL**: 15 minutos (900s)
- **Headers**: `Cache-Control: public, max-age=900`

### Validación
- **Size**: 0.01° - 10° (cutouts)
- **Pixels**: 64 - 2048
- **Radius**: 0.001° - 5° (cone search)

## 🐛 Troubleshooting

### Cutouts no cargan
- Verifica que el survey name sea exacto (case-sensitive)
- Algunos surveys requieren pre-búsqueda SIA (Simple Image Access)
- Check backend logs para errores de IRSA/SkyView

### Resolución de nombres falla
- IRSA TAP puede estar saturado → retry con backoff
- Nombres deben coincidir con catálogo (ej: "NGC 7000" no "NGC7000")
- Usa coordenadas directamente como fallback

### Aladin Lite no carga
- Verifica CDN en index.html: `https://aladin.cds.unistra.fr/AladinLite/api/v3/latest/aladin.js`
- Revisa consola del navegador para errores de CORS

## 📖 Referencias

- **Aladin Lite v3 API**: https://aladin.cds.unistra.fr/AladinLite/doc/API/
- **IRSA Documentation**: https://irsa.ipac.caltech.edu/docs/
- **SkyView Guide**: https://skyview.gsfc.nasa.gov/current/help/index.html
- **ADQL Tutorial**: http://www.ivoa.net/documents/ADQL/

## 🤝 Contributing

Este proyecto es una demo para el reto "Embiggen Your Eyes!". Pull requests y mejoras son bienvenidas.

## 📄 License

MIT
