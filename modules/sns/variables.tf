variable "project_name" {
  type = string
}

variable "environment" {
  type = string
}

variable "notification_email" {
  description = "Email para receber notificações de download de materiais"
  type        = string
}
