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

variable "eventbridge_rule_arn" {
  type = string
}