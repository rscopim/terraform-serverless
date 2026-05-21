output "api_endpoint" {
  value = aws_apigatewayv2_api.this.api_endpoint
}

output "leads_endpoint" {
  value = "${aws_apigatewayv2_api.this.api_endpoint}/leads"
}

output "api_id" {
  value = aws_apigatewayv2_api.this.id
}