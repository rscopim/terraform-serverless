output "lambda_function_name" {
  description = "Nome da função Lambda criada"
  value       = module.hello_lambda.lambda_function_name
}

output "lambda_function_arn" {
  description = "ARN da função Lambda criada"
  value       = module.hello_lambda.lambda_function_arn
}