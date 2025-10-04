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
