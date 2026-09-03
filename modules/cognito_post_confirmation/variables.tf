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

variable "leads_table_name" {
  description = "Nome da tabela DynamoDB de leads"
  type        = string
}

variable "leads_table_arn" {
  description = "ARN da tabela DynamoDB de leads"
  type        = string
}

variable "sns_topic_arn" {
  description = "ARN do tópico SNS para notificações"
  type        = string
}
