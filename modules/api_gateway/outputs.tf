output "api_endpoint" {
  value = aws_apigatewayv2_api.this.api_endpoint
}

output "leads_endpoint" {
  value = "${aws_apigatewayv2_api.this.api_endpoint}/leads"
}

output "api_id" {
  value = aws_apigatewayv2_api.this.id
}

output "execution_arn" {
  value = aws_apigatewayv2_api.this.execution_arn
}

output "counter_endpoint" {
  value = "${aws_apigatewayv2_api.this.api_endpoint}/counter"
}

output "costs_endpoint" {
  value = "${aws_apigatewayv2_api.this.api_endpoint}/costs"
}

output "governance_endpoint" {
  value = "${aws_apigatewayv2_api.this.api_endpoint}/governance"
}

output "admin_login_endpoint" {
  description = "Endpoint de login administrativo"
  value       = "${aws_apigatewayv2_api.this.api_endpoint}/auth/login"
}

output "admin_users_endpoint" {
  description = "Endpoint de gestão de usuários administrativos"
  value       = "${aws_apigatewayv2_api.this.api_endpoint}/auth/users"
}

output "admin_logout_endpoint" {
  description = "Endpoint de logout administrativo"
  value       = "${aws_apigatewayv2_api.this.api_endpoint}/auth/logout"
}

output "progress_endpoint" {
  description = "Endpoint da API de progresso do aluno"
  value       = "${aws_apigatewayv2_api.this.api_endpoint}/progress"
}
