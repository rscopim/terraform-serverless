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
  value       = module.api_gateway.api_endpoint
}

output "cloudfront_domain_name" {
  description = "Domínio padrão do CloudFront"
  value       = module.cloudfront.cloudfront_domain_name
}