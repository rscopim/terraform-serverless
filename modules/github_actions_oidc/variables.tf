variable "project_name" {
  description = "Nome do projeto"
  type        = string
}

variable "environment" {
  description = "Ambiente"
  type        = string
}

variable "github_owner" {
  description = "Usuário ou organização do GitHub"
  type        = string
}

variable "github_repository" {
  description = "Nome do repositório GitHub"
  type        = string
}

variable "github_branch" {
  description = "Branch autorizada"
  type        = string
  default     = "main"
}