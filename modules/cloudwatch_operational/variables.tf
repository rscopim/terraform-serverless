variable "project_name" {
  type = string
}

variable "environment" {
  type = string
}

variable "aws_region" {
  type = string
}

variable "sns_topic_arn" {
  type = string
}

variable "register_lead_lambda_name" {
  type = string
}

variable "download_metrics_lambda_name" {
  type = string
}

variable "api_gateway_id" {
  type = string
}

variable "dynamodb_table_name" {
  type = string
}

variable "sqs_queue_name" {
  type = string
}

variable "sqs_dlq_name" {
  type = string
}

variable "sns_topic_name" {
  type = string
}

variable "cloudfront_distribution_id" {
  type = string
}