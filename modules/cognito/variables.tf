variable "project_name" {
  description = "Nome do projeto"
  type        = string
}

variable "environment" {
  description = "Ambiente de implantação"
  type        = string
}

variable "ses_source_arn" {
  description = "ARN de uma identidade SES verificada para envio de e-mails (opcional). Se vazio, usa o envio padrão do Cognito (limite de 50 e-mails/dia)."
  type        = string
  default     = ""
}

variable "ses_from_email" {
  description = "Endereço de e-mail remetente quando usando SES (ex: no-reply@cloudtrilhas.com.br)"
  type        = string
  default     = ""
}

variable "post_confirmation_lambda_arn" {
  description = "ARN da Lambda de Post Confirmation (grava lead no cadastro). Vazio = sem trigger."
  type        = string
  default     = ""
}
