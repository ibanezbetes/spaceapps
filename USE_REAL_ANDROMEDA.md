# 🌌 Usar Imagen Real de Andrómeda

Tienes **3 opciones** para usar una imagen real de Andrómeda:

---

## ✨ Opción 1: Setup Rápido (Recomendado para empezar)

Usa una imagen más pequeña de ESO (300 MB):

```powershell
.\quick_setup.ps1
```

Este script:
1. Descarga imagen de ESO (300 MB en vez de 4.3 GB)
2. Genera tiles automáticamente
3. Configura el frontend

Luego ejecuta:
```powershell
# Terminal 1
npx http-server . -p 8080 --cors

# Terminal 2
npm run dev

# Terminal 3
cd frontend ; npm run dev
```

---

## 🚀 Opción 2: Imagen Completa del Hubble (4.3 GB)

Para la mejor calidad (1.5 billones de píxeles):

```powershell
.\setup_andromeda.ps1
```

Este script:
1. Descarga la imagen gigante del Hubble (4.3 GB)
2. Genera tiles Deep Zoom
3. Configura el frontend con las coordenadas correctas

**⚠️ Requisitos:**
- 10+ GB de espacio libre
- Conexión rápida a internet
- libvips instalado ([descargar](https://github.com/libvips/libvips/releases))

---

## 🎯 Opción 3: Configuración Manual

### Paso 1: Obtener una imagen

**Opción A - Hubble (mejor calidad):**
```powershell
# Descargar 4.3 GB
Invoke-WebRequest -Uri "https://hubblesite.org/files/live/sites/hubble/files/home/resource-gallery/images/_images/STSCI-H-p1501a-f-21536x14781.png" -OutFile "andromeda_hubble.png"
```

**Opción B - ESO (más ligera):**
```powershell
# Descargar 300 MB
Invoke-WebRequest -Uri "https://www.eso.org/public/archives/images/original/eso1532a.jpg" -OutFile "andromeda_eso.jpg"
```

### Paso 2: Instalar libvips

1. Descarga: https://github.com/libvips/libvips/releases
2. Instala y agrega al PATH
3. Verifica: `vips --version`

### Paso 3: Generar tiles

```powershell
# Para imagen Hubble
vips dzsave andromeda_hubble.png andromeda_hubble --suffix .jpg[Q=92]

# O para imagen ESO
vips dzsave andromeda_eso.jpg andromeda_eso --suffix .jpg[Q=90]
```

### Paso 4: Configurar frontend

Edita `frontend\.env`:

```env
# Para imagen Hubble
VITE_API_BASE_URL=http://localhost:3000
VITE_TILES_URL=http://localhost:8080/andromeda_hubble.dzi
VITE_PROJECTION_TYPE=gnomonic
VITE_IMAGE_CENTER_RA=10.6847
VITE_IMAGE_CENTER_DEC=41.269
VITE_IMAGE_WIDTH_PX=21536
VITE_IMAGE_HEIGHT_PX=14781
VITE_PIXEL_SCALE_ARCSEC_PER_PX=0.11
VITE_ENABLE_SSE=true
VITE_DEFAULT_LIMIT=500
```

```env
# O para imagen ESO
VITE_API_BASE_URL=http://localhost:3000
VITE_TILES_URL=http://localhost:8080/andromeda_eso.dzi
VITE_PROJECTION_TYPE=gnomonic
VITE_IMAGE_CENTER_RA=10.6847
VITE_IMAGE_CENTER_DEC=41.269
VITE_IMAGE_WIDTH_PX=30000
VITE_IMAGE_HEIGHT_PX=19980
VITE_PIXEL_SCALE_ARCSEC_PER_PX=0.5
VITE_ENABLE_SSE=true
VITE_DEFAULT_LIMIT=500
```

### Paso 5: Servir tiles

```powershell
npx http-server . -p 8080 --cors
```

### Paso 6: Lanzar aplicación

```powershell
# Backend (nueva terminal)
npm run dev

# Frontend (nueva terminal)
cd frontend ; npm run dev
```

Abre: http://localhost:5173

---

## 📊 Comparación de Opciones

| Característica | ESO (Rápido) | Hubble (Completo) |
|----------------|--------------|-------------------|
| **Tamaño descarga** | 300 MB | 4.3 GB |
| **Resolución** | 30,000 × 19,980 px | 21,536 × 14,781 px |
| **Tiempo descarga** | 1-5 min | 10-30 min |
| **Tiempo procesamiento** | 2-3 min | 5-10 min |
| **Calidad zoom** | Buena | Excelente |
| **Espacio disco** | ~1 GB total | ~10 GB total |

---

## 🔧 Troubleshooting

### "vips no reconocido como comando"
- Instala libvips: https://github.com/libvips/libvips/releases
- Reinicia PowerShell después de instalar
- Verifica PATH: `$env:PATH`

### "Error descargando imagen"
- Verifica conexión a internet
- Prueba descargar manualmente desde el navegador
- Usa la imagen ESO más pequeña

### "Los objetos no coinciden con la imagen"
La imagen de demo no es de Andrómeda, por eso necesitas usar una imagen real:
1. Ejecuta `.\quick_setup.ps1` para obtener imagen de ESO
2. O descarga manualmente una imagen de Andrómeda
3. Ajusta las coordenadas en `frontend\.env`

### "Tiles muy lentos"
- Reduce calidad: `--suffix .jpg[Q=80]`
- Usa nginx en lugar de http-server
- Considera usar CDN

---

## 🎯 Próximos Pasos

1. **Ejecuta setup rápido**: `.\quick_setup.ps1`
2. **Lanza servidores**: Ver comandos arriba
3. **Calibra proyección**: Ver `ANDROMEDA_SETUP.md`
4. **Explora**: Abre http://localhost:5173

---

## 📚 Recursos

- **Guía completa**: `frontend/ANDROMEDA_SETUP.md`
- **Hubble Andromeda**: https://hubblesite.org/contents/media/images/2015/02/3471-Image
- **ESO Images**: https://www.eso.org/public/images/
- **libvips**: https://github.com/libvips/libvips
- **Calibración**: Ver `ANDROMEDA_SETUP.md`
