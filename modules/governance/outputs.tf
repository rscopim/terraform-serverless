output "lambda_function_name" {
  description = "Nome da Lambda de governança"
  value       = aws_lambda_function.this.function_name
}

output "lambda_function_arn" {
  description = "ARN da Lambda de governança"
  value       = aws_lambda_function.this.arn
}

output "lambda_invoke_arn" {
  description = "Invoke ARN da Lambda de governança"
  value       = aws_lambda_function.this.invoke_arn
}