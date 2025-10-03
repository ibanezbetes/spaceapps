# Script para lanzar Milky Way Explorer
Write-Host "🌌 Iniciando Milky Way Explorer..." -ForegroundColor Cyan

# Directorio del proyecto
$projectDir = "C:\Users\daniz\Documents\GitHub\spaceapps"
$clientDir = "$projectDir\client"

# Lanzar el backend en una nueva ventana
Write-Host "🚀 Iniciando Backend (puerto 3000)..." -ForegroundColor Green
Start-Process pwsh -ArgumentList "-NoExit", "-Command", "cd '$projectDir'; npm run dev"

# Esperar 3 segundos para que el backend inicie
Start-Sleep -Seconds 3

# Lanzar el frontend en una nueva ventana
Write-Host "🎨 Iniciando Frontend (puerto 5173)..." -ForegroundColor Green
Start-Process pwsh -ArgumentList "-NoExit", "-Command", "cd '$clientDir'; npm run dev"

# Esperar 5 segundos para que Vite inicie
Start-Sleep -Seconds 5

# Abrir el navegador
Write-Host "🌐 Abriendo navegador..." -ForegroundColor Yellow
Start-Process "http://localhost:5173"

Write-Host ""
Write-Host "✅ Milky Way Explorer iniciado!" -ForegroundColor Green
Write-Host "   Backend:  http://localhost:3000" -ForegroundColor Cyan
Write-Host "   Frontend: http://localhost:5173" -ForegroundColor Cyan
Write-Host ""
Write-Host "Para detener los servidores, cierra las ventanas de PowerShell que se abrieron." -ForegroundColor Yellow
