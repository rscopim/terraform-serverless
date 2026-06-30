variable "project_name" {
  description = "Nome do projeto"
  type        = string
}

variable "environment" {
  description = "Ambiente"
  type        = string
}

variable "lambda_source_file" {
  description = "Arquivo fonte da Lambda"
  type        = string
}

variable "lambda_output_path" {
  description = "Caminho do ZIP gerado"
  type        = string
}

variable "dynamodb_table_name" {
  description = "Nome da tabela DynamoDB"
  type        = string
}

variable "dynamodb_table_arn" {
  description = "ARN da tabela DynamoDB"
  type        = string
}

variable "allowed_origin" {
  description = "Origem permitida para chamada da API"
  type        = string
}