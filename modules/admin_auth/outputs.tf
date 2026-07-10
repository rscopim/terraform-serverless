output "admin_login_function_name" {
  description = "Nome da Lambda responsável pelo login administrativo"
  value       = aws_lambda_function.admin_login.function_name
}

output "admin_login_function_arn" {
  description = "ARN da Lambda responsável pelo login administrativo"
  value       = aws_lambda_function.admin_login.arn
}

output "admin_login_invoke_arn" {
  description = "Invoke ARN da Lambda responsável pelo login administrativo"
  value       = aws_lambda_function.admin_login.invoke_arn
}

output "admin_users_function_name" {
  description = "Nome da Lambda responsável pela gestão de usuários"
  value       = aws_lambda_function.admin_users.function_name
}

output "admin_users_function_arn" {
  description = "ARN da Lambda responsável pela gestão de usuários"
  value       = aws_lambda_function.admin_users.arn
}

output "admin_users_invoke_arn" {
  description = "Invoke ARN da Lambda responsável pela gestão de usuários"
  value       = aws_lambda_function.admin_users.invoke_arn
}

output "admin_users_table_name" {
  description = "Nome da tabela DynamoDB de usuários administrativos"
  value       = aws_dynamodb_table.admin_users.name
}

output "admin_users_table_arn" {
  description = "ARN da tabela DynamoDB de usuários administrativos"
  value       = aws_dynamodb_table.admin_users.arn
}