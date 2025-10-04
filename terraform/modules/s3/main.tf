variable "project_name" { type = string }
variable "environment" { type = string }
variable "bucket_name" { type = string }
variable "index_document" { type = string }
variable "error_document" { type = string }
variable "upload_enabled" { type = bool }
variable "upload_dir" { type = string }

# Generar nombre si no se pasa
locals {
  final_bucket_name = var.bucket_name != "" ? var.bucket_name : lower(replace("${var.project_name}-${var.environment}-site-${random_id.suffix.hex}", "_", "-"))
}

resource "random_id" "suffix" {
  byte_length = 4
}

resource "aws_s3_bucket" "site" {
  bucket = local.final_bucket_name

  tags = {
    Name        = local.final_bucket_name
    Environment = var.environment
  }
}

resource "aws_s3_bucket_ownership_controls" "site" {
  bucket = aws_s3_bucket.site.id
  rule {
    object_ownership = "BucketOwnerPreferred"
  }
}

resource "aws_s3_bucket_public_access_block" "site" {
  bucket = aws_s3_bucket.site.id

  block_public_acls       = false
  block_public_policy     = false
  ignore_public_acls      = false
  restrict_public_buckets = false
}

resource "aws_s3_bucket_policy" "public_read" {
  bucket = aws_s3_bucket.site.id
  policy = jsonencode({
    Version = "2012-10-17",
    Statement = [
      {
        Sid       = "PublicReadGetObject",
        Effect    = "Allow",
        Principal = "*",
        Action    = ["s3:GetObject"],
        Resource  = ["${aws_s3_bucket.site.arn}/*"],
      }
    ]
  })
}

resource "aws_s3_bucket_website_configuration" "site" {
  bucket = aws_s3_bucket.site.id
  index_document {
    suffix = var.index_document
  }
  error_document {
    key = var.error_document
  }
}

# Subida de archivos estáticos (si está activado)
resource "aws_s3_object" "static_files" {
  for_each = var.upload_enabled ? fileset(var.upload_dir, "**/*") : []
  bucket   = aws_s3_bucket.site.id
  key      = each.value
  source   = "${var.upload_dir}/${each.value}"
  etag     = filemd5("${var.upload_dir}/${each.value}")
  content_type = lookup({
    html = "text/html",
    css  = "text/css",
    js   = "application/javascript",
    ico  = "image/x-icon",
    png  = "image/png",
    jpg  = "image/jpeg",
    jpeg = "image/jpeg",
    svg  = "image/svg+xml",
    json = "application/json"
  }, split(".", lower(each.value))[length(split(".", lower(each.value))) - 1], "application/octet-stream")
}

output "bucket_name" {
  value = aws_s3_bucket.site.bucket
}

output "website_endpoint" {
  value = aws_s3_bucket_website_configuration.site.website_endpoint
}
