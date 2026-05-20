variable "project_name" {
  description = "Nome do projeto"
  type        = string
}

variable "environment" {
  description = "Ambiente do projeto"
  type        = string
}

variable "bucket_name" {
  description = "materiais-e-trilhas-de-estudos"
  type        = string
}

variable "index_file_path" {
  description = "Caminho do arquivo index.html"
  type        = string
}

variable "style_file_path" {
  description = "Caminho do arquivo style.css"
  type        = string
}

variable "materials_path" {
  description = "Caminho da pasta de materiais PDF"
  type        = string
}

variable "cloudfront_distribution_arn" {
  description = "ARN da distribuição CloudFront"
  type        = string
}