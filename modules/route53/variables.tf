variable "project_name" {
  type = string
}

variable "environment" {
  type = string
}

variable "domain_name" {
  type = string
}

variable "hosted_zone_name" {
  description = "Nome da zona hospedada principal no Route 53"
  type        = string
}