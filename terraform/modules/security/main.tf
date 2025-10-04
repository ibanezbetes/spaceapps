variable "vpc_id" { type = string }
variable "environment" { type = string }
variable "allowed_ips" { type = list(string) }
variable "app_port" { type = number }

resource "aws_security_group" "web" {
  name        = "bug-lightyear-${var.environment}-web-sg"
  description = "Allow web traffic"
  vpc_id      = var.vpc_id

  ingress {
    description = "HTTP"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "HTTPS"
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "App Port"
    from_port   = var.app_port
    to_port     = var.app_port
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "bug-lightyear-${var.environment}-web-sg"
  }
}

resource "aws_security_group" "ssh" {
  name        = "bug-lightyear-${var.environment}-ssh-sg"
  description = "Allow SSH from allowed IPs"
  vpc_id      = var.vpc_id

  ingress {
    description = "SSH"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = var.allowed_ips
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "bug-lightyear-${var.environment}-ssh-sg"
  }
}

output "web_sg_id" { value = aws_security_group.web.id }
output "ssh_sg_id" { value = aws_security_group.ssh.id }
