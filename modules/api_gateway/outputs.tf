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