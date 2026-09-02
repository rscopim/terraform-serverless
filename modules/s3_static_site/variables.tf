variable "project_name" {
  description = "Nome do projeto"
  type        = string
}

variable "environment" {
  description = "Ambiente do projeto"
  type        = string
}

variable "bucket_name" {
  description = "materiais-e-trilhas-de-estudos"
  type        = string
}

variable "index_file_path" {
  description = "Caminho do arquivo index.html"
  type        = string
}

variable "style_file_path" {
  description = "Caminho do arquivo style.css"
  type        = string
}

variable "materials_path" {
  description = "Caminho da pasta de materiais PDF"
  type        = string
}

variable "cloudfront_distribution_arn" {
  description = "ARN da distribuição CloudFront"
  type        = string
}

variable "api_endpoint" {
  description = "Endpoint da API de leads"
  type        = string
}

variable "visitor_counter_endpoint" {
  description = "Endpoint da API do contador de visitantes"
  type        = string
}

variable "cognito_region" {
  description = "Região AWS do Cognito User Pool (para o frontend)"
  type        = string
  default     = ""
}

variable "cognito_user_pool_id" {
  description = "ID do Cognito User Pool (para o frontend)"
  type        = string
  default     = ""
}

variable "cognito_client_id" {
  description = "ID do client web Cognito (para o frontend)"
  type        = string
  default     = ""
}

variable "progress_endpoint" {
  description = "Endpoint da API de progresso do aluno (para o frontend)"
  type        = string
  default     = ""
}