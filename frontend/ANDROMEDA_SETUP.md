# Configuración de Imagen Real de Andrómeda

## Opción 1: Usar Imagen del Hubble (Recomendado para Producción)

### Paso 1: Descargar la imagen
La imagen oficial de Andrómeda del Hubble tiene **1.5 billones de píxeles** (4.3 GB):

```bash
# Descarga desde NASA Hubble
# URL: https://hubblesite.org/contents/media/images/2015/02/3471-Image
# Archivo: STSCI-H-p1501a-f-21536x14781.png (4.3 GB)

# Con curl:
curl -o andromeda_hubble.png "https://hubblesite.org/files/live/sites/hubble/files/home/resource-gallery/images/_images/STSCI-H-p1501a-f-21536x14781.png"

# Con wget:
wget -O andromeda_hubble.png "https://hubblesite.org/files/live/sites/hubble/files/home/resource-gallery/images/_images/STSCI-H-p1501a-f-21536x14781.png"
```

**Coordenadas de la imagen del Hubble:**
- **Centro RA**: 10.6847° (0h 42m 44s)
- **Centro Dec**: +41.269° (41° 16' 9")
- **Dimensiones**: 21536 × 14781 píxeles
- **Escala**: ~0.11 arcsec/pixel

### Paso 2: Generar tiles con libvips

```bash
# Instalar libvips
# Windows: descarga desde https://github.com/libvips/libvips/releases
# macOS: brew install vips
# Linux: sudo apt install libvips-tools

# Generar tiles Deep Zoom
vips dzsave andromeda_hubble.png andromeda_hubble --suffix .jpg[Q=92]

# Esto crea:
# - andromeda_hubble.dzi (archivo XML descriptor)
# - andromeda_hubble_files/ (carpeta con tiles)
```

### Paso 3: Servir los tiles

```bash
# Opción A: Servidor HTTP simple
npx http-server . -p 8080 --cors

# Opción B: Python
python -m http.server 8080 --bind 127.0.0.1

# Opción C: Usar un servidor web (nginx, Apache, etc.)
```

### Paso 4: Configurar el frontend

Crea `frontend/.env` con:

```env
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

---

## Opción 2: Usar Imagen más Ligera (Para Desarrollo Rápido)

### ESO Andromeda (300 MB, 30,000 × 19,980 px)

```bash
# Descargar de ESO
curl -o andromeda_eso.jpg "https://www.eso.org/public/archives/images/original/eso1532a.jpg"

# Generar tiles
vips dzsave andromeda_eso.jpg andromeda_eso --suffix .jpg[Q=90]

# Servir
npx http-server . -p 8080 --cors
```

**Configuración `.env`:**
```env
VITE_TILES_URL=http://localhost:8080/andromeda_eso.dzi
VITE_IMAGE_WIDTH_PX=30000
VITE_IMAGE_HEIGHT_PX=19980
VITE_PIXEL_SCALE_ARCSEC_PER_PX=0.5
```

---

## Opción 3: Usar Servicio IIIF Público (Sin Descarga)

Algunos museos y observatorios ofrecen servidores IIIF con imágenes astronómicas.

**Ventaja**: No necesitas descargar ni procesar nada.
**Desventaja**: Depende de servicios externos.

### Ejemplo con IIIF (si está disponible):
```env
VITE_TILES_URL=https://iiif.example.org/andromeda/info.json
```

---

## Calibración de Proyección

Para que las coordenadas RA/Dec coincidan con los píxeles:

### 1. Encuentra un objeto conocido
- Abre tu imagen
- Identifica una estrella o galaxia catalogada (ej: M31 center, NGC 206)
- Anota su posición en píxeles (x, y)

### 2. Busca sus coordenadas celestes
- Usa SIMBAD: http://simbad.u-strasbg.fr/simbad/
- Busca el objeto y copia RA/Dec en grados

### 3. Calcula el centro y escala

**Centro de imagen:**
```
VITE_IMAGE_CENTER_RA = RA_del_objeto_central (en grados)
VITE_IMAGE_CENTER_DEC = Dec_del_objeto_central (en grados)
```

**Escala de píxeles:**
1. Encuentra dos objetos conocidos separados
2. Mide la distancia angular entre ellos (ΔRA, ΔDec)
3. Mide la distancia en píxeles (Δpx)
4. Calcula: `pixel_scale = (distancia_angular_en_grados × 3600) / Δpx` (arcsec/px)

### 4. Verifica
- Haz clic en objetos conocidos
- Compara las coordenadas mostradas con catálogos (SIMBAD, Aladin)
- Ajusta si es necesario

---

## Script Automatizado de Descarga y Procesamiento

Crea un archivo `download_and_process.sh`:

```bash
#!/bin/bash

echo "🌌 Descargando imagen de Andrómeda del Hubble..."

# Descargar imagen (4.3 GB - puede tardar)
curl -L -o andromeda_hubble.png \
  "https://hubblesite.org/files/live/sites/hubble/files/home/resource-gallery/images/_images/STSCI-H-p1501a-f-21536x14781.png"

if [ $? -ne 0 ]; then
    echo "❌ Error descargando la imagen"
    exit 1
fi

echo "✅ Imagen descargada: $(du -h andromeda_hubble.png | cut -f1)"

# Verificar si vips está instalado
if ! command -v vips &> /dev/null; then
    echo "❌ libvips no está instalado"
    echo "   macOS: brew install vips"
    echo "   Ubuntu: sudo apt install libvips-tools"
    echo "   Windows: https://github.com/libvips/libvips/releases"
    exit 1
fi

echo "🔧 Generando tiles Deep Zoom..."
vips dzsave andromeda_hubble.png andromeda_hubble --suffix .jpg[Q=92]

if [ $? -ne 0 ]; then
    echo "❌ Error generando tiles"
    exit 1
fi

echo "✅ Tiles generados en ./andromeda_hubble_files/"

# Crear .env si no existe
if [ ! -f frontend/.env ]; then
    echo "📝 Creando frontend/.env..."
    cat > frontend/.env << EOF
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
EOF
    echo "✅ .env creado"
else
    echo "ℹ️  frontend/.env ya existe, no se sobrescribió"
fi

echo ""
echo "🎉 ¡Listo! Ahora ejecuta:"
echo ""
echo "   # Terminal 1: Servir tiles"
echo "   npx http-server . -p 8080 --cors"
echo ""
echo "   # Terminal 2: Backend"
echo "   npm run dev"
echo ""
echo "   # Terminal 3: Frontend"
echo "   cd frontend && npm run dev"
echo ""
echo "Luego abre: http://localhost:5173"
```

Haz el script ejecutable:
```bash
chmod +x download_and_process.sh
./download_and_process.sh
```

---

## PowerShell Script para Windows

Crea `download_and_process.ps1`:

```powershell
Write-Host "🌌 Descargando imagen de Andrómeda del Hubble..." -ForegroundColor Cyan

$url = "https://hubblesite.org/files/live/sites/hubble/files/home/resource-gallery/images/_images/STSCI-H-p1501a-f-21536x14781.png"
$output = "andromeda_hubble.png"

Invoke-WebRequest -Uri $url -OutFile $output

if (-not (Test-Path $output)) {
    Write-Host "❌ Error descargando la imagen" -ForegroundColor Red
    exit 1
}

$fileSize = (Get-Item $output).Length / 1MB
Write-Host "✅ Imagen descargada: $([math]::Round($fileSize, 2)) MB" -ForegroundColor Green

# Verificar vips
if (-not (Get-Command vips -ErrorAction SilentlyContinue)) {
    Write-Host "❌ libvips no está instalado" -ForegroundColor Red
    Write-Host "   Descarga desde: https://github.com/libvips/libvips/releases" -ForegroundColor Yellow
    exit 1
}

Write-Host "🔧 Generando tiles Deep Zoom..." -ForegroundColor Cyan
vips dzsave $output "andromeda_hubble" --suffix ".jpg[Q=92]"

Write-Host "✅ Tiles generados" -ForegroundColor Green

# Crear .env
if (-not (Test-Path "frontend\.env")) {
    Write-Host "📝 Creando frontend\.env..." -ForegroundColor Cyan
    @"
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
"@ | Out-File -FilePath "frontend\.env" -Encoding utf8
    Write-Host "✅ .env creado" -ForegroundColor Green
}

Write-Host ""
Write-Host "🎉 ¡Listo! Ejecuta en terminales separadas:" -ForegroundColor Green
Write-Host ""
Write-Host "   # Terminal 1: Servir tiles" -ForegroundColor Yellow
Write-Host "   npx http-server . -p 8080 --cors"
Write-Host ""
Write-Host "   # Terminal 2: Backend" -ForegroundColor Yellow
Write-Host "   npm run dev"
Write-Host ""
Write-Host "   # Terminal 3: Frontend" -ForegroundColor Yellow
Write-Host "   cd frontend ; npm run dev"
```

Ejecutar:
```powershell
.\download_and_process.ps1
```

---

## Troubleshooting

### La descarga falla
- Verifica tu conexión a internet
- El archivo es grande (4.3 GB), puede tardar
- Prueba con la imagen ESO más pequeña

### libvips no funciona
- Windows: Asegúrate de agregar vips al PATH
- Verifica instalación: `vips --version`
- Alternativa: usa la herramienta online de OpenSeadragon

### Los objetos no coinciden con la imagen
- Verifica las coordenadas del centro de tu imagen
- Ajusta `PIXEL_SCALE_ARCSEC_PER_PX`
- Usa Aladin Lite para comparar: https://aladin.u-strasbg.fr/AladinLite/

### Tiles muy lentos
- Reduce la calidad JPEG: `--suffix .jpg[Q=85]`
- Usa un servidor más rápido (nginx en lugar de http-server)
- Considera usar CDN para producción

---

## Recursos

- **Hubble Andromeda**: https://hubblesite.org/contents/media/images/2015/02/3471-Image
- **ESO Images**: https://www.eso.org/public/images/
- **SIMBAD (coordenadas)**: http://simbad.u-strasbg.fr/simbad/
- **Aladin Lite (verificación)**: https://aladin.u-strasbg.fr/AladinLite/
- **libvips**: https://github.com/libvips/libvips
- **OpenSeadragon**: https://openseadragon.github.io/
