output "lambda_function_name" {
  description = "Nome da Lambda de autenticação administrativa"
  value       = aws_lambda_function.this.function_name
}

output "lambda_function_arn" {
  description = "ARN da Lambda de autenticação administrativa"
  value       = aws_lambda_function.this.arn
}

output "lambda_invoke_arn" {
  description = "Invoke ARN da Lambda de autenticação administrativa"
  value       = aws_lambda_function.this.invoke_arn
}

output "admin_users_table_name" {
  description = "Nome da tabela DynamoDB de usuários admin"
  value       = aws_dynamodb_table.admin_users.name
}

output "admin_users_table_arn" {
  description = "ARN da tabela DynamoDB de usuários admin"
  value       = aws_dynamodb_table.admin_users.arn
}