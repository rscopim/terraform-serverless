resource "aws_route53_zone" "this" {
  name = var.domain_name

  tags = {
    Project     = var.project_name
    Environment = var.environment
    ManagedBy   = "Terraform"
  }
}