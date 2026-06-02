output "cloudtrilhas_url" {
  description = "URL principal do portal CloudTrilhas"
  value       = module.cloudfront.website_url
}

output "cloudtrilhas_www_url" {
  description = "URL alternativa www"
  value       = module.cloudfront.www_website_url
}

output "leads_api_endpoint" {
  description = "Endpoint da API de captura de leads"
  value       = module.api_gateway.leads_endpoint
}

output "cloudfront_domain_name" {
  description = "Domínio padrão do CloudFront"
  value       = module.cloudfront.cloudfront_domain_name
}

output "cloudfront_distribution_arn" {
  description = "ARN da distribuição CloudFront"
  value       = module.cloudfront.cloudfront_distribution_arn
}

output "operational_dashboard_name" {
  description = "Nome do dashboard operacional do CloudTrilhas"
  value       = module.cloudwatch_operational.dashboard_name
}

output "github_actions_role_arn" {
  description = "ARN da role IAM usada pelo GitHub Actions"
  value       = module.github_actions_oidc.github_actions_role_arn
}