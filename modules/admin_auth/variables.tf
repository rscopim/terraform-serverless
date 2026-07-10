variable "project_name" {
  description = "Nome do projeto"
  type        = string
}

variable "environment" {
  description = "Ambiente"
  type        = string
}

variable "admin_login_source_file" {
  description = "Caminho do arquivo Python da Lambda de login"
  type        = string
}

variable "admin_login_output_path" {
  description = "Caminho do ZIP gerado para a Lambda de login"
  type        = string
}

variable "admin_users_source_file" {
  description = "Caminho do arquivo Python da Lambda de gestão de usuários"
  type        = string
}

variable "admin_users_output_path" {
  description = "Caminho do ZIP gerado para a Lambda de gestão de usuários"
  type        = string
}

variable "allowed_origins" {
  description = "Origens autorizadas a consumir as APIs administrativas"
  type        = string
}