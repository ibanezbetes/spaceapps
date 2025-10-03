# Script de descarga y procesamiento de imagen de Andrómeda
# Ejecutar: .\setup_andromeda.ps1

Write-Host "🌌 Configuración de Imagen de Andrómeda para el Explorador" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""

# Verificar si ya existe la imagen
if (Test-Path "andromeda_hubble.png") {
    $response = Read-Host "La imagen ya existe. ¿Quieres volver a descargarla? (s/N)"
    if ($response -ne 's' -and $response -ne 'S') {
        Write-Host "Saltando descarga..." -ForegroundColor Yellow
        goto ProcessTiles
    }
}

Write-Host "📥 Descargando imagen de Andrómeda del Hubble (4.3 GB)..." -ForegroundColor Yellow
Write-Host "   Esto puede tardar varios minutos dependiendo de tu conexión..." -ForegroundColor Gray
Write-Host ""

$url = "https://hubblesite.org/files/live/sites/hubble/files/home/resource-gallery/images/_images/STSCI-H-p1501a-f-21536x14781.png"
$output = "andromeda_hubble.png"

try {
    # Mostrar progreso
    $ProgressPreference = 'Continue'
    Invoke-WebRequest -Uri $url -OutFile $output -UseBasicParsing
    
    $fileSize = (Get-Item $output).Length / 1GB
    Write-Host ""
    Write-Host "✅ Imagen descargada exitosamente: $([math]::Round($fileSize, 2)) GB" -ForegroundColor Green
    Write-Host ""
} catch {
    Write-Host "❌ Error descargando la imagen: $_" -ForegroundColor Red
    Write-Host ""
    Write-Host "Opciones alternativas:" -ForegroundColor Yellow
    Write-Host "1. Descarga manualmente desde:" -ForegroundColor Gray
    Write-Host "   https://hubblesite.org/contents/media/images/2015/02/3471-Image" -ForegroundColor Gray
    Write-Host "2. Usa una imagen más pequeña de ESO:" -ForegroundColor Gray
    Write-Host "   https://www.eso.org/public/archives/images/original/eso1532a.jpg" -ForegroundColor Gray
    exit 1
}

:ProcessTiles

# Verificar si vips está instalado
Write-Host "🔍 Verificando libvips..." -ForegroundColor Cyan
if (-not (Get-Command vips -ErrorAction SilentlyContinue)) {
    Write-Host "❌ libvips no está instalado" -ForegroundColor Red
    Write-Host ""
    Write-Host "Por favor instala libvips:" -ForegroundColor Yellow
    Write-Host "1. Descarga desde: https://github.com/libvips/libvips/releases" -ForegroundColor Gray
    Write-Host "2. Instala y agrega al PATH" -ForegroundColor Gray
    Write-Host "3. Reinicia PowerShell" -ForegroundColor Gray
    Write-Host "4. Ejecuta este script nuevamente" -ForegroundColor Gray
    Write-Host ""
    Write-Host "Alternativa: usa Python con Pillow/deepzoom" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ libvips encontrado" -ForegroundColor Green
Write-Host ""

# Verificar si ya existen los tiles
if (Test-Path "andromeda_hubble.dzi") {
    $response = Read-Host "Los tiles ya existen. ¿Regenerar? (s/N)"
    if ($response -ne 's' -and $response -ne 'S') {
        Write-Host "Usando tiles existentes..." -ForegroundColor Yellow
        goto ConfigureEnv
    }
}

Write-Host "🔧 Generando tiles Deep Zoom..." -ForegroundColor Yellow
Write-Host "   Esto puede tardar 5-10 minutos..." -ForegroundColor Gray
Write-Host ""

try {
    & vips dzsave "andromeda_hubble.png" "andromeda_hubble" --suffix ".jpg[Q=92]"
    Write-Host ""
    Write-Host "✅ Tiles generados exitosamente" -ForegroundColor Green
    Write-Host "   Ubicación: ./andromeda_hubble_files/" -ForegroundColor Gray
    Write-Host ""
} catch {
    Write-Host "❌ Error generando tiles: $_" -ForegroundColor Red
    exit 1
}

:ConfigureEnv

# Crear archivo .env para el frontend
Write-Host "📝 Configurando frontend..." -ForegroundColor Cyan

$envPath = "frontend\.env"
$envContent = @"
# Backend API
VITE_API_BASE_URL=http://localhost:3000

# Tiles de Andrómeda del Hubble
VITE_TILES_URL=http://localhost:8080/andromeda_hubble.dzi

# Proyección - Coordenadas de Andrómeda (M31)
VITE_PROJECTION_TYPE=gnomonic
VITE_IMAGE_CENTER_RA=10.6847
VITE_IMAGE_CENTER_DEC=41.269
VITE_IMAGE_WIDTH_PX=21536
VITE_IMAGE_HEIGHT_PX=14781
VITE_PIXEL_SCALE_ARCSEC_PER_PX=0.11

# Características
VITE_ENABLE_SSE=true
VITE_DEFAULT_LIMIT=500
"@

if (Test-Path $envPath) {
    $response = Read-Host "frontend\.env ya existe. ¿Sobrescribir? (s/N)"
    if ($response -eq 's' -or $response -eq 'S') {
        $envContent | Out-File -FilePath $envPath -Encoding utf8
        Write-Host "✅ frontend\.env actualizado" -ForegroundColor Green
    } else {
        Write-Host "⏭️  Manteniendo .env existente" -ForegroundColor Yellow
    }
} else {
    $envContent | Out-File -FilePath $envPath -Encoding utf8
    Write-Host "✅ frontend\.env creado" -ForegroundColor Green
}

Write-Host ""
Write-Host "🎉 ¡Configuración completada!" -ForegroundColor Green
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Para lanzar la aplicación, ejecuta en terminales separadas:" -ForegroundColor Yellow
Write-Host ""
Write-Host "Terminal 1 - Servidor de tiles:" -ForegroundColor Cyan
Write-Host "   npx http-server . -p 8080 --cors" -ForegroundColor White
Write-Host ""
Write-Host "Terminal 2 - Backend:" -ForegroundColor Cyan
Write-Host "   npm run dev" -ForegroundColor White
Write-Host ""
Write-Host "Terminal 3 - Frontend:" -ForegroundColor Cyan
Write-Host "   cd frontend ; npm run dev" -ForegroundColor White
Write-Host ""
Write-Host "Luego abre tu navegador en: http://localhost:5173" -ForegroundColor Green
Write-Host ""
Write-Host "Presiona cualquier tecla para salir..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
