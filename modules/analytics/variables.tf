variable "project_name" {
  type = string
}

variable "environment" {
  type = string
}

variable "lambda_source_file" {
  type = string
}

variable "lambda_output_path" {
  type = string
}

variable "dynamodb_table_name" {
  type = string
}

variable "dynamodb_table_arn" {
  type = string
}

variable "sns_topic_arn" {
  type = string
}

variable "api_gateway_id" {
  type        = string
  description = "ID do API Gateway existente para adicionar rota GET /analytics"
}

variable "api_gateway_execution_arn" {
  type        = string
  description = "Execution ARN do API Gateway para permissão da Lambda"
}
