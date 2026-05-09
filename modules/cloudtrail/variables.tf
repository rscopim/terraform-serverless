variable "project_name" {
  type = string
}

variable "environment" {
  type = string
}

variable "target_bucket_arn" {
  description = "ARN do bucket do site"
  type        = string
}