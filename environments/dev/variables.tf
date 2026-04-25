variable "aws_region" {
  description = "Região padrão do projeto"
  type        = string
  default     = "us-west-2"
}

variable "project_name" {
  description = "Nome do projeto"
  type        = string
  default     = "Terraform-Serverless"
}

variable "environment" {
  description = "Ambiente de implantação"
  type        = string
  default     = "dev"
}