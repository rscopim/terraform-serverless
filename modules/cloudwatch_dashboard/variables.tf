variable "project_name" {
  description = "Nome do projeto"
  type        = string
}

variable "environment" {
  description = "Ambiente do projeto"
  type        = string
}

variable "aws_region" {
  description = "Região AWS"
  type        = string
}

variable "metric_namespace" {
  description = "Namespace da métrica customizada"
  type        = string
  default     = "TerraformServerless/Downloads"
}

variable "bucket_name" {
  description = "Nome do bucket do site"
  type        = string
}