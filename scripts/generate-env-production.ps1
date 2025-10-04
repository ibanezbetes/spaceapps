param(
  [string]$TerraformDir = "../terraform",
  [string]$ClientDir = "../client",
  [string]$OutputVar = "elastic_ip"
)

$ErrorActionPreference = "Stop"

Write-Host "🔎 Leyendo output de Terraform..."
Push-Location $TerraformDir
try {
  $ip = terraform output -raw $OutputVar
} finally {
  Pop-Location
}

if (-not $ip) {
  Write-Error "No se pudo obtener el output '$OutputVar'. Asegúrate de haber ejecutado 'terraform apply'."
}

$envFile = Join-Path $ClientDir ".env.production"

Write-Host "📝 Generando $envFile con VITE_API_URL=http://$ip"
Set-Content -Path $envFile -Value "VITE_API_URL=http://$ip" -Encoding UTF8

Write-Host "✅ Archivo .env.production generado."
