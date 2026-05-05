output "lambda_function_name" {
  description = "Nome da função Lambda criada"
  value       = module.hello_lambda.lambda_function_name
}

output "lambda_function_arn" {
  description = "ARN da função Lambda criada"
  value       = module.hello_lambda.lambda_function_arn
}

output "static_site_bucket_name" {
  description = "Nome do bucket do portal de estudos"
  value       = module.s3_static_site.bucket_name
}

output "static_site_url" {
  description = "URL do portal de estudos"
  value       = module.s3_static_site.website_url
}