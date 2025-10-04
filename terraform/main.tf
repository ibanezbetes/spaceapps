terraform {
  required_version = ">= 1.6.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = ">= 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

locals {
  project_tag = "${var.project_name}-${var.environment}"
}

# -----------------------------
# Networking (VPC + Subnet)
# -----------------------------
module "vpc" {
  source         = "./modules/vpc"
  project_name   = var.project_name
  environment    = var.environment
  vpc_cidr_block = var.vpc_cidr_block
  public_subnet_cidr = var.public_subnet_cidr
}

# -----------------------------
# Security Groups
# -----------------------------
module "security" {
  source       = "./modules/security"
  vpc_id       = module.vpc.vpc_id
  environment  = var.environment
  allowed_ips  = var.allowed_ips
  app_port     = var.app_port
}

# -----------------------------
# EC2 Instance (Server)
# -----------------------------
module "ec2" {
  source              = "./modules/ec2"
  environment         = var.environment
  instance_type       = var.instance_type
  subnet_id           = module.vpc.public_subnet_id
  security_group_ids  = [module.security.web_sg_id, module.security.ssh_sg_id]
  existing_key_name   = var.existing_key_name
  app_port            = var.app_port
  root_volume_size    = var.root_volume_size
  create_eip          = var.create_eip
  docker_image        = var.docker_image
  gemini_api_key      = var.gemini_api_key
}

# -----------------------------
# S3 Static Website (Frontend)
# -----------------------------
module "s3_website" {
  source         = "./modules/s3"
  project_name   = var.project_name
  environment    = var.environment
  bucket_name    = var.s3_bucket_name
  index_document = "index.html"
  error_document = "index.html"

  # Ruta local del build del frontend (asegúrate de ejecutar npm run build antes)
  upload_enabled = var.upload_frontend
  upload_dir     = "${path.root}/../client/dist"
}

# -----------------------------
# Outputs
# -----------------------------
output "instance_public_ip" {
  value       = module.ec2.public_ip
  description = "IP pública de la instancia EC2"
}

output "elastic_ip" {
  value       = module.ec2.elastic_ip
  description = "Elastic IP asignada (si create_eip = true)"
}

output "ssh_command" {
  value       = module.ec2.ssh_command
  description = "Comando SSH para conectarse a la instancia"
}

output "s3_bucket_name" {
  value       = module.s3_website.bucket_name
  description = "Nombre del bucket S3 para el sitio"
}

output "s3_website_url" {
  value       = module.s3_website.website_endpoint
  description = "URL del sitio web estático en S3"
}
