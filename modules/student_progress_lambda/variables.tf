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
  description = "Nome da tabela DynamoDB de progresso"
  type        = string
}

variable "dynamodb_table_arn" {
  description = "ARN da tabela DynamoDB de progresso"
  type        = string
}

variable "leads_table_name" {
  description = "Nome da tabela de leads (para gravar a origem do aluno)"
  type        = string
  default     = ""
}

variable "leads_table_arn" {
  description = "ARN da tabela de leads (para permissão de PutItem)"
  type        = string
  default     = ""
}

variable "cognito_user_pool_arn" {
  description = "ARN do Cognito User Pool (para validar o access token via GetUser)"
  type        = string
}

variable "allowed_origins" {
  description = "Origens permitidas para a API, separadas por vírgula"
  type        = string
}
