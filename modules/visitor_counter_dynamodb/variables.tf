variable "project_name" {
  description = "Nome do projeto"
  type        = string
}

variable "environment" {
  description = "Ambiente de implantação"
  type        = string
}

variable "table_name" {
  description = "Nome da tabela DynamoDB do contador de visitantes"
  type        = string
}