param(
  [string]$TerraformDir = "../terraform",
  [switch]$AutoApprove
)

$ErrorActionPreference = "Stop"

# 1) Generar .env.production con IP de EC2
Write-Host "📄 Generando .env.production desde outputs de Terraform..."
& "$PSScriptRoot/generate-env-production.ps1" -TerraformDir $TerraformDir -ClientDir "../client" -OutputVar "elastic_ip"

# 2) Build del frontend
Write-Host "🏗️  Construyendo frontend (Vite)..."
Push-Location ../client
try {
  if (-not (Test-Path package-lock.json) -or -not (Test-Path node_modules)) {
    npm ci
  }
  npm run build
} finally {
  Pop-Location
}

# 3) Subir a S3 con Terraform (upload_frontend=true)
Write-Host "☁️  Subiendo build a S3 con Terraform..."
Push-Location $TerraformDir
try {
  # Sobrescribir variable upload_frontend a true (sin tocar archivos)
  if ($AutoApprove) {
    terraform apply -var "upload_frontend=true" -auto-approve
  } else {
    terraform apply -var "upload_frontend=true"
  }
} finally {
  Pop-Location
}

Write-Host "✅ Frontend construido y subido a S3. Revisa el output 's3_website_url'."
