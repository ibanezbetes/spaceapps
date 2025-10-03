# Script rápido para descargar imagen ligera de Andrómeda
# Ejecutar: .\quick_setup.ps1

Write-Host "🚀 Setup Rápido - Imagen Ligera de Andrómeda" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# Usar imagen de Andrómeda disponible públicamente
# Opción: Wikimedia Commons - Imagen de calidad media (más confiable)
$url = "https://upload.wikimedia.org/wikipedia/commons/9/98/Andromeda_Galaxy_%28with_h-alpha%29.jpg"
$output = "andromeda_wiki.jpg"

if (-not (Test-Path $output)) {
    Write-Host "📥 Descargando imagen desde Wikimedia Commons..." -ForegroundColor Yellow
    try {
        Invoke-WebRequest -Uri $url -OutFile $output -UseBasicParsing
        Write-Host "✅ Descarga completada" -ForegroundColor Green
    } catch {
        Write-Host "❌ Error: $_" -ForegroundColor Red
        Write-Host "Descarga manualmente desde: $url" -ForegroundColor Yellow
        exit 1
    }
} else {
    Write-Host "✅ Imagen ya existe" -ForegroundColor Green
}

Write-Host ""

# Verificar vips
if (-not (Get-Command vips -ErrorAction SilentlyContinue)) {
    Write-Host "⚠️  libvips no encontrado" -ForegroundColor Yellow
    Write-Host "Por favor instala desde: https://github.com/libvips/libvips/releases" -ForegroundColor Gray
    Write-Host ""
    Write-Host "Mientras tanto, puedes usar tiles de demo:" -ForegroundColor Cyan
    
    $envContent = @"
VITE_API_BASE_URL=http://localhost:3000
VITE_TILES_URL=https://openseadragon.github.io/example-images/highsmith/highsmith.dzi
VITE_PROJECTION_TYPE=gnomonic
VITE_IMAGE_CENTER_RA=10.6847
VITE_IMAGE_CENTER_DEC=41.269
VITE_IMAGE_WIDTH_PX=20000
VITE_IMAGE_HEIGHT_PX=15000
VITE_PIXEL_SCALE_ARCSEC_PER_PX=0.5
VITE_ENABLE_SSE=true
VITE_DEFAULT_LIMIT=500
"@
    $envContent | Out-File -FilePath "frontend\.env" -Encoding utf8
    Write-Host "✅ Configurado con tiles de demo" -ForegroundColor Green
    exit 0
}

# Generar tiles
if (-not (Test-Path "andromeda_wiki.dzi")) {
    Write-Host "🔧 Generando tiles..." -ForegroundColor Yellow
    & vips dzsave $output "andromeda_wiki" --suffix ".jpg[Q=90]"
    Write-Host "✅ Tiles generados" -ForegroundColor Green
} else {
    Write-Host "✅ Tiles ya existen" -ForegroundColor Green
}

# Configurar .env
$envContent = @"
VITE_API_BASE_URL=http://localhost:3000
VITE_TILES_URL=http://localhost:8080/andromeda_wiki.dzi
VITE_PROJECTION_TYPE=gnomonic
VITE_IMAGE_CENTER_RA=10.6847
VITE_IMAGE_CENTER_DEC=41.269
VITE_IMAGE_WIDTH_PX=10000
VITE_IMAGE_HEIGHT_PX=7500
VITE_PIXEL_SCALE_ARCSEC_PER_PX=1.0
VITE_ENABLE_SSE=true
VITE_DEFAULT_LIMIT=500
"@

$envContent | Out-File -FilePath "frontend\.env" -Encoding utf8
Write-Host ""
Write-Host "🎉 ¡Listo!" -ForegroundColor Green
Write-Host ""
Write-Host "Ejecuta en terminales separadas:" -ForegroundColor Yellow
Write-Host "1. npx http-server . -p 8080 --cors" -ForegroundColor White
Write-Host "2. npm run dev" -ForegroundColor White
Write-Host "3. cd frontend ; npm run dev" -ForegroundColor White
