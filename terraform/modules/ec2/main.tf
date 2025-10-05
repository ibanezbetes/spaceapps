variable "environment" { type = string }
variable "instance_type" { type = string }
variable "subnet_id" { type = string }
variable "security_group_ids" { type = list(string) }
variable "existing_key_name" { type = string }
variable "app_port" { type = number }
variable "root_volume_size" { type = number }
variable "create_eip" { type = bool }
variable "docker_image" { type = string }
variable "gemini_api_key" { type = string }
variable "frontend_url" { type = string }

# AMI Amazon Linux 2023 x86_64
data "aws_ami" "al2023" {
  most_recent = true
  owners      = ["amazon"]
  filter {
    name   = "name"
    values = ["al2023-ami-*-x86_64"]
  }
  filter {
    name   = "virtualization-type"
    values = ["hvm"]
  }
}

# User data: instala Docker y ejecuta la app
locals {
  user_data = <<-EOT
              #!/bin/bash
              set -e
              
              # Log todo para debugging
              exec > >(tee /var/log/user-data.log) 2>&1
              echo "=== INICIANDO USER DATA SCRIPT ==="
              date
              
              # Actualizar sistema
              echo "Actualizando sistema..."
              yum update -y
              
              # Instalar dependencias
              echo "Instalando Docker y Git..."
              yum install -y docker git curl
              
              # Configurar Docker
              echo "Configurando Docker..."
              systemctl enable docker
              systemctl start docker
              usermod -a -G docker ec2-user
              
              # Esperar que Docker esté listo
              echo "Esperando que Docker esté listo..."
              sleep 10
              
              # Variables de entorno
              echo "Configurando variables de entorno..."
              echo "GEMINI_API_KEY=${var.gemini_api_key}" >> /etc/environment
              echo "FRONTEND_URL=${var.frontend_url}" >> /etc/environment
              echo "PORT=3000" >> /etc/environment
              
              # Clonar repositorio
              echo "Clonando repositorio..."
              git clone https://github.com/ibanezbetes/spaceapps.git /opt/spaceapps
              cd /opt/spaceapps
              
              # Construir imagen Docker
              echo "Construyendo imagen Docker..."
              docker build -t milkyway-backend:latest .
              
              # Verificar que la imagen se construyó
              docker images | grep milkyway-backend
              
              # Ejecutar contenedor backend
              echo "Ejecutando contenedor backend..."
              docker run -d \
                --name milkyway-backend \
                --restart unless-stopped \
                -p 3000:3000 \
                -e GEMINI_API_KEY="${var.gemini_api_key}" \
                -e FRONTEND_URL="${var.frontend_url}" \
                -e PORT=3000 \
                -e NODE_ENV=production \
                milkyway-backend:latest
              
              # Verificar que el contenedor está corriendo
              echo "Verificando estado del contenedor..."
              docker ps -a
              docker logs milkyway-backend
              
              # Crear script de health check
              cat > /opt/health-check.sh << 'HEALTH_EOF'
              #!/bin/bash
              echo "=== HEALTH CHECK $(date) ==="
              echo "Docker status:"
              systemctl status docker --no-pager
              echo "Container status:"
              docker ps -a
              echo "Backend logs (últimas 20 líneas):"
              docker logs --tail 20 milkyway-backend 2>/dev/null || echo "No logs available"
              echo "Network test:"
              curl -s http://localhost:3000/health || echo "Health endpoint not responding"
              echo "=========================="
              HEALTH_EOF
              
              chmod +x /opt/health-check.sh
              
              echo "=== USER DATA SCRIPT COMPLETADO ==="
              date
              
              EOT
}

resource "aws_instance" "this" {
  ami                         = data.aws_ami.al2023.id
  instance_type               = var.instance_type
  subnet_id                   = var.subnet_id
  vpc_security_group_ids      = var.security_group_ids
  key_name                    = var.existing_key_name
  associate_public_ip_address = true

  user_data = local.user_data

  root_block_device {
    volume_size = var.root_volume_size
    volume_type = "gp3"
  }

  metadata_options {
    http_endpoint = "enabled"
    http_tokens   = "required"
  }

  tags = {
    Name        = "bug-lightyear-${var.environment}-app"
    Environment = var.environment
  }
}

resource "aws_eip" "this" {
  count    = var.create_eip ? 1 : 0
  instance = aws_instance.this.id
  domain   = "vpc"
  tags = {
    Name = "bug-lightyear-${var.environment}-eip"
  }
}

output "public_ip" {
  value = aws_instance.this.public_ip
}

output "elastic_ip" {
  value = var.create_eip ? aws_eip.this[0].public_ip : null
}

output "ssh_command" {
  value = "ssh -i ~/.ssh/${var.existing_key_name}.pem ec2-user@${var.create_eip ? aws_eip.this[0].public_ip : aws_instance.this.public_ip}"
}
