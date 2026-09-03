output "lambda_function_arn" {
  description = "ARN da Lambda de post confirmation"
  value       = aws_lambda_function.this.arn
}

output "lambda_function_name" {
  description = "Nome da Lambda de post confirmation"
  value       = aws_lambda_function.this.function_name
}
