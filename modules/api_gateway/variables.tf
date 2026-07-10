variable "project_name" {
  type = string
}

variable "environment" {
  type = string
}

variable "lambda_invoke_arn" {
  type = string
}

variable "lambda_function_name" {
  type = string
}

variable "visitor_counter_lambda_invoke_arn" {
  type = string
}

variable "visitor_counter_lambda_function_name" {
  type = string
}

variable "costs_lambda_invoke_arn" {
  type = string
}

variable "costs_lambda_function_name" {
  type = string
}

variable "governance_lambda_invoke_arn" {
  type = string
}

variable "governance_lambda_function_name" {
  type = string
}

variable "admin_login_lambda_invoke_arn" {
  description = "Invoke ARN da Lambda de login administrativo"
  type        = string
}

variable "admin_login_lambda_function_name" {
  description = "Nome da Lambda de login administrativo"
  type        = string
}

variable "admin_users_lambda_invoke_arn" {
  description = "Invoke ARN da Lambda de gestão de usuários"
  type        = string
}

variable "admin_users_lambda_function_name" {
  description = "Nome da Lambda de gestão de usuários"
  type        = string
}