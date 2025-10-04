variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "us-east-1"
}

variable "project_name" {
  description = "Project name"
  type        = string
  default     = "bug-lightyear"
}

variable "environment" {
  description = "Environment (dev/staging/prod)"
  type        = string
  default     = "prod"
}

variable "vpc_cidr_block" {
  description = "CIDR for the VPC"
  type        = string
  default     = "10.0.0.0/16"
}

variable "public_subnet_cidr" {
  description = "CIDR for the public subnet"
  type        = string
  default     = "10.0.1.0/24"
}

variable "allowed_ips" {
  description = "List of CIDR blocks allowed to SSH"
  type        = list(string)
  default     = ["0.0.0.0/0"]
}

variable "instance_type" {
  description = "EC2 instance type"
  type        = string
  default     = "t3.small"
}

variable "existing_key_name" {
  description = "Existing AWS key pair name to use for SSH"
  type        = string
}

variable "app_port" {
  description = "Application port exposed by the Node app"
  type        = number
  default     = 3000
}

variable "root_volume_size" {
  description = "Size of root EBS volume in GB"
  type        = number
  default     = 20
}

variable "create_eip" {
  description = "Whether to create and associate an Elastic IP"
  type        = bool
  default     = true
}

variable "docker_image" {
  description = "Docker image to run on EC2 (leave empty to build from repo)"
  type        = string
  default     = ""
}

variable "gemini_api_key" {
  description = "Google Gemini API Key (optional, can be set in EC2 user-data)"
  type        = string
  sensitive   = true
  default     = ""
}

variable "s3_bucket_name" {
  description = "Optional custom S3 bucket name for website (leave empty to auto-generate)"
  type        = string
  default     = ""
}

variable "upload_frontend" {
  description = "Upload local client/dist contents to S3 website bucket"
  type        = bool
  default     = false
}
