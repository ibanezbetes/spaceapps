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
              yum update -y
              yum install -y docker git
              systemctl enable docker
              systemctl start docker
              usermod -a -G docker ec2-user

              echo GEMINI_API_KEY=${var.gemini_api_key} >> /etc/environment

              # Clonar repo y construir imagen si no se especifica docker_image
              if [ -z "${var.docker_image}" ]; then
                git clone https://github.com/ibanezbetes/spaceapps.git /opt/spaceapps
                cd /opt/spaceapps
                docker build -t bug-lightyear-explorer:latest .
                IMAGE_TO_RUN=bug-lightyear-explorer:latest
              else
                docker pull ${var.docker_image}
                IMAGE_TO_RUN=${var.docker_image}
              fi

              # Ejecutar contenedor
              docker run -d --name bug-lightyear-app \
                --restart unless-stopped \
                -p 80:${var.app_port} \
                -p ${var.app_port}:${var.app_port} \
                -e GEMINI_API_KEY=${var.gemini_api_key} \
                ${IMAGE_TO_RUN}

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
