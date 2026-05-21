variable "project_name" {
  description = "Nome do projeto usado na tag Project"
  type        = string
}

variable "environment" {
  description = "Ambiente do projeto"
  type        = string
}

variable "limit_amount" {
  description = "Valor mensal máximo do budget em USD"
  type        = string
  default     = "10"
}

variable "notification_emails" {
  description = "Lista de e-mails que receberão alertas do budget"
  type        = list(string)
}