output "lambda_function_name" {
  description = "Nome da Lambda de custos"
  value       = aws_lambda_function.this.function_name
}

output "lambda_function_arn" {
  description = "ARN da Lambda de custos"
  value       = aws_lambda_function.this.arn
}

output "lambda_invoke_arn" {
  description = "Invoke ARN da Lambda de custos"
  value       = aws_lambda_function.this.invoke_arn
}

output "cache_table_name" {
  description = "Nome da tabela DynamoDB de cache de custos"
  value       = aws_dynamodb_table.costs_cache.name
}

output "cache_table_arn" {
  description = "ARN da tabela DynamoDB de cache de custos"
  value       = aws_dynamodb_table.costs_cache.arn
}