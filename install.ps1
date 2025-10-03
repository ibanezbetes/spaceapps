# Script de instalación completa para Milky Way Explorer
# PowerShell

Write-Host ""
Write-Host "🌌 Milky Way Explorer - Instalación Completa" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Colores
$success = "Green"
$info = "Cyan"
$error = "Red"

try {
    # 1. Instalar dependencias del backend
    Write-Host "📦 [1/3] Instalando dependencias del backend..." -ForegroundColor $info
    npm install
    
    if ($LASTEXITCODE -ne 0) {
        throw "Error instalando dependencias del backend"
    }
    
    Write-Host "✅ Backend dependencies instaladas" -ForegroundColor $success
    Write-Host ""

    # 2. Instalar dependencias del frontend
    Write-Host "📦 [2/3] Instalando dependencias del frontend..." -ForegroundColor $info
    Set-Location client
    npm install
    
    if ($LASTEXITCODE -ne 0) {
        Set-Location ..
        throw "Error instalando dependencias del frontend"
    }
    
    Set-Location ..
    Write-Host "✅ Frontend dependencies instaladas" -ForegroundColor $success
    Write-Host ""

    # 3. Copiar archivos de configuración
    Write-Host "⚙️  [3/3] Configurando archivos de entorno..." -ForegroundColor $info
    
    if (-not (Test-Path ".env")) {
        Copy-Item ".env.server" ".env"
        Write-Host "✅ .env creado desde .env.server" -ForegroundColor $success
    } else {
        Write-Host "⚠️  .env ya existe, no se sobrescribió" -ForegroundColor Yellow
    }
    
    Write-Host ""

    # Resumen
    Write-Host "================================================" -ForegroundColor Cyan
    Write-Host "✅ INSTALACIÓN COMPLETA" -ForegroundColor Green
    Write-Host "================================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "🚀 Para iniciar el proyecto:" -ForegroundColor $info
    Write-Host ""
    Write-Host "   Backend (terminal 1):" -ForegroundColor Yellow
    Write-Host "   npm run dev" -ForegroundColor White
    Write-Host ""
    Write-Host "   Frontend (terminal 2):" -ForegroundColor Yellow
    Write-Host "   cd client" -ForegroundColor White
    Write-Host "   npm run dev" -ForegroundColor White
    Write-Host ""
    Write-Host "📡 URLs:" -ForegroundColor $info
    Write-Host "   Backend:  http://localhost:3000" -ForegroundColor White
    Write-Host "   Frontend: http://localhost:5173" -ForegroundColor White
    Write-Host ""
    Write-Host "📖 Documentación: Ver MILKYWAY_README.md" -ForegroundColor $info
    Write-Host ""

} catch {
    Write-Host ""
    Write-Host "❌ ERROR: $_" -ForegroundColor $error
    Write-Host ""
    exit 1
}
