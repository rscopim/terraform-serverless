variable "aws_region" {
  description = "Região padrão do projeto"
  type        = string
}

variable "project_name" {
  description = "Nome do projeto"
  type        = string
}

variable "environment" {
  description = "Ambiente de implantação"
  type        = string
}

variable "domain_name" {
  description = "Domínio principal do portal"
  type        = string
}