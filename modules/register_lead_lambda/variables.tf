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

variable "pdf_base_url" {
  type = string
}

variable "sns_topic_arn" {
  type        = string
  description = "ARN do SNS topic para notificações de download"
}
