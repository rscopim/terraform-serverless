output "api_endpoint" {
  value = aws_apigatewayv2_api.this.api_endpoint
}

output "leads_endpoint" {
  value = "${aws_apigatewayv2_api.this.api_endpoint}/leads"
}