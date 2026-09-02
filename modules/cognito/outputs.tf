output "user_pool_id" {
  description = "ID do Cognito User Pool"
  value       = aws_cognito_user_pool.this.id
}

output "user_pool_arn" {
  description = "ARN do Cognito User Pool"
  value       = aws_cognito_user_pool.this.arn
}

output "client_id" {
  description = "ID do client web (usado pelo frontend)"
  value       = aws_cognito_user_pool_client.web.id
}

output "user_pool_endpoint" {
  description = "Endpoint do User Pool"
  value       = aws_cognito_user_pool.this.endpoint
}
