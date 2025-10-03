# Script completo para instalar libvips y configurar Andrómeda
# Ejecutar como Administrador si es posible

Write-Host "🌌 Instalación Completa - libvips + Imagen de Andrómeda" -ForegroundColor Cyan
Write-Host "=========================================================" -ForegroundColor Cyan
Write-Host ""

# Paso 1: Verificar si vips ya está instalado
Write-Host "📋 Paso 1: Verificando libvips..." -ForegroundColor Yellow
if (Get-Command vips -ErrorAction SilentlyContinue) {
    Write-Host "✅ libvips ya está instalado" -ForegroundColor Green
    & vips --version
    Write-Host ""
    $skipInstall = $true
} else {
    Write-Host "⚠️  libvips no encontrado" -ForegroundColor Yellow
    Write-Host ""
    $skipInstall = $false
}

# Paso 2: Descargar e instalar libvips si no está
if (-not $skipInstall) {
    Write-Host "📋 Paso 2: Descargando libvips..." -ForegroundColor Yellow
    Write-Host "   Esto puede tardar unos minutos..." -ForegroundColor Gray
    Write-Host ""
    
    $vipsVersion = "8.15.1"
    $vipsUrl = "https://github.com/libvips/build-win64-mxe/releases/download/v$vipsVersion/vips-dev-w64-all-$vipsVersion.zip"
    $vipsZip = "vips.zip"
    $vipsDir = "C:\vips"
    
    try {
        Write-Host "   Descargando desde GitHub..." -ForegroundColor Gray
        Invoke-WebRequest -Uri $vipsUrl -OutFile $vipsZip -UseBasicParsing
        Write-Host "   ✅ Descarga completada" -ForegroundColor Green
    } catch {
        Write-Host "   ❌ Error descargando libvips automáticamente" -ForegroundColor Red
        Write-Host ""
        Write-Host "   Por favor descarga manualmente:" -ForegroundColor Yellow
        Write-Host "   1. Abre: https://github.com/libvips/build-win64-mxe/releases" -ForegroundColor White
        Write-Host "   2. Descarga: vips-dev-w64-all-$vipsVersion.zip" -ForegroundColor White
        Write-Host "   3. Extrae a: C:\vips" -ForegroundColor White
        Write-Host "   4. Ejecuta este script de nuevo" -ForegroundColor White
        Write-Host ""
        Read-Host "Presiona Enter para salir"
        exit 1
    }
    
    Write-Host ""
    Write-Host "📋 Paso 3: Extrayendo libvips a C:\vips..." -ForegroundColor Yellow
    
    # Crear directorio si no existe
    if (Test-Path $vipsDir) {
        Write-Host "   Removiendo instalación anterior..." -ForegroundColor Gray
        Remove-Item -Path $vipsDir -Recurse -Force -ErrorAction SilentlyContinue
    }
    
    # Extraer
    try {
        Expand-Archive -Path $vipsZip -DestinationPath "C:\" -Force
        
        # El zip extrae a vips-dev-X.Y.Z, renombrar a vips
        $extractedDir = Get-ChildItem "C:\" -Directory | Where-Object { $_.Name -like "vips-dev*" } | Select-Object -First 1
        if ($extractedDir) {
            Move-Item -Path $extractedDir.FullName -Destination $vipsDir -Force
        }
        
        Write-Host "   ✅ Extracción completada" -ForegroundColor Green
    } catch {
        Write-Host "   ❌ Error extrayendo: $_" -ForegroundColor Red
        exit 1
    }
    
    # Limpiar zip
    Remove-Item $vipsZip -Force -ErrorAction SilentlyContinue
    
    Write-Host ""
    Write-Host "📋 Paso 4: Agregando al PATH..." -ForegroundColor Yellow
    
    $vipsBin = "$vipsDir\bin"
    
    # Verificar si ya está en el PATH
    $currentPath = [Environment]::GetEnvironmentVariable("Path", "Machine")
    if ($currentPath -notlike "*$vipsBin*") {
        try {
            # Intentar agregar al PATH del sistema (requiere permisos de admin)
            $newPath = $currentPath + ";$vipsBin"
            [Environment]::SetEnvironmentVariable("Path", $newPath, "Machine")
            Write-Host "   ✅ Agregado al PATH del sistema" -ForegroundColor Green
            Write-Host "   ⚠️  Necesitas reiniciar PowerShell para que tome efecto" -ForegroundColor Yellow
        } catch {
            # Si falla, agregar al PATH de usuario
            $userPath = [Environment]::GetEnvironmentVariable("Path", "User")
            $newUserPath = $userPath + ";$vipsBin"
            [Environment]::SetEnvironmentVariable("Path", $newUserPath, "User")
            Write-Host "   ✅ Agregado al PATH del usuario" -ForegroundColor Green
            Write-Host "   ⚠️  Necesitas reiniciar PowerShell para que tome efecto" -ForegroundColor Yellow
        }
        
        # Agregar temporalmente a la sesión actual
        $env:Path += ";$vipsBin"
    }
    
    Write-Host ""
    Write-Host "📋 Paso 5: Verificando instalación..." -ForegroundColor Yellow
    
    if (Get-Command vips -ErrorAction SilentlyContinue) {
        Write-Host "   ✅ libvips instalado correctamente" -ForegroundColor Green
        & vips --version
    } else {
        Write-Host "   ⚠️  vips instalado pero no disponible en esta sesión" -ForegroundColor Yellow
        Write-Host "   Por favor reinicia PowerShell y ejecuta:" -ForegroundColor Yellow
        Write-Host "   vips dzsave andromeda_wiki.jpg andromeda_wiki --suffix .jpg[Q=90]" -ForegroundColor White
        exit 0
    }
}

Write-Host ""
Write-Host "📋 Paso 6: Verificando imagen de Andrómeda..." -ForegroundColor Yellow

if (-not (Test-Path "andromeda_wiki.jpg")) {
    Write-Host "   ⚠️  Imagen no encontrada, descargando..." -ForegroundColor Yellow
    $url = "https://upload.wikimedia.org/wikipedia/commons/9/98/Andromeda_Galaxy_%28with_h-alpha%29.jpg"
    Invoke-WebRequest -Uri $url -OutFile "andromeda_wiki.jpg" -UseBasicParsing
    Write-Host "   ✅ Imagen descargada" -ForegroundColor Green
} else {
    Write-Host "   ✅ Imagen ya existe" -ForegroundColor Green
}

Write-Host ""
Write-Host "📋 Paso 7: Generando tiles Deep Zoom..." -ForegroundColor Yellow
Write-Host "   Esto puede tardar 2-5 minutos..." -ForegroundColor Gray
Write-Host ""

if (Test-Path "andromeda_wiki.dzi") {
    $response = Read-Host "   Los tiles ya existen. ¿Regenerar? (s/N)"
    if ($response -ne 's' -and $response -ne 'S') {
        Write-Host "   ⏭️  Usando tiles existentes" -ForegroundColor Yellow
    } else {
        Remove-Item "andromeda_wiki.dzi" -Force
        Remove-Item "andromeda_wiki_files" -Recurse -Force -ErrorAction SilentlyContinue
        & vips dzsave "andromeda_wiki.jpg" "andromeda_wiki" --suffix ".jpg[Q=90]"
        Write-Host "   ✅ Tiles regenerados" -ForegroundColor Green
    }
} else {
    try {
        & vips dzsave "andromeda_wiki.jpg" "andromeda_wiki" --suffix ".jpg[Q=90]"
        Write-Host ""
        Write-Host "   ✅ Tiles generados exitosamente" -ForegroundColor Green
        Write-Host "   📁 Ubicación: ./andromeda_wiki_files/" -ForegroundColor Gray
    } catch {
        Write-Host "   ❌ Error generando tiles: $_" -ForegroundColor Red
        Write-Host "   Verifica que vips esté correctamente instalado" -ForegroundColor Yellow
        exit 1
    }
}

Write-Host ""
Write-Host "📋 Paso 8: Configurando frontend/.env..." -ForegroundColor Yellow

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
Write-Host "   ✅ frontend\.env actualizado" -ForegroundColor Green

Write-Host ""
Write-Host "🎉 ¡Instalación completada exitosamente!" -ForegroundColor Green
Write-Host "=========================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "📊 Resumen:" -ForegroundColor Cyan
Write-Host "   ✅ libvips instalado en C:\vips" -ForegroundColor Green
Write-Host "   ✅ Imagen descargada: andromeda_wiki.jpg" -ForegroundColor Green
Write-Host "   ✅ Tiles generados: andromeda_wiki.dzi + andromeda_wiki_files/" -ForegroundColor Green
Write-Host "   ✅ Frontend configurado" -ForegroundColor Green
Write-Host ""
Write-Host "🚀 Para lanzar la aplicación:" -ForegroundColor Yellow
Write-Host ""
Write-Host "   Abre 3 terminales PowerShell:" -ForegroundColor White
Write-Host ""
Write-Host "   Terminal 1 - Servidor de tiles:" -ForegroundColor Cyan
Write-Host "   npx http-server . -p 8080 --cors" -ForegroundColor White
Write-Host ""
Write-Host "   Terminal 2 - Backend API:" -ForegroundColor Cyan
Write-Host "   npm run dev" -ForegroundColor White
Write-Host ""
Write-Host "   Terminal 3 - Frontend SPA:" -ForegroundColor Cyan
Write-Host "   cd frontend ; npm run dev" -ForegroundColor White
Write-Host ""
Write-Host "   Luego abre tu navegador en: http://localhost:5173" -ForegroundColor Green
Write-Host ""
Write-Host "Presiona cualquier tecla para salir..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
