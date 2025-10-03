# Script para iniciar Backend y Frontend simultáneamente
# PowerShell

Write-Host ""
Write-Host "🌌 Milky Way Explorer - Iniciando Servidores" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host ""

$ErrorActionPreference = "Continue"

# Función para mostrar error y salir
function Show-Error {
    param($Message)
    Write-Host ""
    Write-Host "❌ ERROR: $Message" -ForegroundColor Red
    Write-Host ""
    exit 1
}

# Verificar que node_modules existen
if (-not (Test-Path "node_modules")) {
    Write-Host "⚠️  Backend dependencies no instaladas" -ForegroundColor Yellow
    Write-Host "Ejecutando: npm install" -ForegroundColor Cyan
    npm install
    if ($LASTEXITCODE -ne 0) {
        Show-Error "Falló la instalación de dependencias del backend"
    }
}

if (-not (Test-Path "client/node_modules")) {
    Write-Host "⚠️  Frontend dependencies no instaladas" -ForegroundColor Yellow
    Write-Host "Ejecutando: npm install en client/" -ForegroundColor Cyan
    Set-Location client
    npm install
    if ($LASTEXITCODE -ne 0) {
        Set-Location ..
        Show-Error "Falló la instalación de dependencias del frontend"
    }
    Set-Location ..
}

# Verificar .env
if (-not (Test-Path ".env")) {
    Write-Host "⚙️  Creando .env desde .env.server..." -ForegroundColor Yellow
    Copy-Item ".env.server" ".env"
}

Write-Host "✅ Verificaciones completadas" -ForegroundColor Green
Write-Host ""

# Crear jobs para backend y frontend
Write-Host "🚀 Iniciando servidores..." -ForegroundColor Cyan
Write-Host ""
Write-Host "   📡 Backend:  http://localhost:3000" -ForegroundColor White
Write-Host "   🌐 Frontend: http://localhost:5173" -ForegroundColor White
Write-Host ""
Write-Host "⚡ Presiona Ctrl+C para detener ambos servidores" -ForegroundColor Yellow
Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray
Write-Host ""

# Iniciar backend en background
$backendJob = Start-Job -ScriptBlock {
    Set-Location $using:PWD
    npm run dev
}

# Dar tiempo al backend para iniciar
Start-Sleep -Seconds 3

# Iniciar frontend en background
$frontendJob = Start-Job -ScriptBlock {
    Set-Location $using:PWD/client
    npm run dev
}

# Mostrar outputs de ambos jobs
try {
    while ($true) {
        # Output del backend
        $backendOutput = Receive-Job -Job $backendJob -ErrorAction SilentlyContinue
        if ($backendOutput) {
            $backendOutput | ForEach-Object {
                Write-Host "[BACKEND] $_" -ForegroundColor Green
            }
        }

        # Output del frontend
        $frontendOutput = Receive-Job -Job $frontendJob -ErrorAction SilentlyContinue
        if ($frontendOutput) {
            $frontendOutput | ForEach-Object {
                Write-Host "[FRONTEND] $_" -ForegroundColor Blue
            }
        }

        # Verificar si alguno falló
        if ($backendJob.State -eq 'Failed') {
            throw "Backend job falló"
        }
        if ($frontendJob.State -eq 'Failed') {
            throw "Frontend job falló"
        }

        Start-Sleep -Milliseconds 200
    }
}
catch {
    Write-Host ""
    Write-Host "⚠️  Deteniendo servidores..." -ForegroundColor Yellow
}
finally {
    # Cleanup
    Stop-Job -Job $backendJob -ErrorAction SilentlyContinue
    Stop-Job -Job $frontendJob -ErrorAction SilentlyContinue
    Remove-Job -Job $backendJob -Force -ErrorAction SilentlyContinue
    Remove-Job -Job $frontendJob -Force -ErrorAction SilentlyContinue
    
    Write-Host ""
    Write-Host "✅ Servidores detenidos" -ForegroundColor Green
    Write-Host ""
}
