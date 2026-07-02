resource "aws_apigatewayv2_api" "this" {
  name          = "${var.project_name}-${var.environment}-leads-api"
  protocol_type = "HTTP"

  cors_configuration {
    allow_headers = ["content-type"]
    allow_methods = ["GET", "POST", "OPTIONS"]
    allow_origins = ["*"]
  }
}

resource "aws_apigatewayv2_integration" "lambda" {
  api_id                 = aws_apigatewayv2_api.this.id
  integration_type       = "AWS_PROXY"
  integration_uri        = var.lambda_invoke_arn
  payload_format_version = "2.0"
}

resource "aws_apigatewayv2_route" "register_lead" {
  api_id    = aws_apigatewayv2_api.this.id
  route_key = "POST /leads"
  target    = "integrations/${aws_apigatewayv2_integration.lambda.id}"
}

resource "aws_apigatewayv2_stage" "default" {
  api_id      = aws_apigatewayv2_api.this.id
  name        = "$default"
  auto_deploy = true
}

resource "aws_lambda_permission" "allow_apigateway" {
  statement_id  = "AllowExecutionFromApiGateway"
  action        = "lambda:InvokeFunction"
  function_name = var.lambda_function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.this.execution_arn}/*/*"
}

resource "aws_apigatewayv2_integration" "visitor_counter_lambda" {
  api_id                 = aws_apigatewayv2_api.this.id
  integration_type       = "AWS_PROXY"
  integration_uri        = var.visitor_counter_lambda_invoke_arn
  payload_format_version = "2.0"
}

resource "aws_apigatewayv2_route" "visitor_counter_get" {
  api_id    = aws_apigatewayv2_api.this.id
  route_key = "GET /counter"
  target    = "integrations/${aws_apigatewayv2_integration.visitor_counter_lambda.id}"
}

resource "aws_apigatewayv2_route" "visitor_counter_post" {
  api_id    = aws_apigatewayv2_api.this.id
  route_key = "POST /counter"
  target    = "integrations/${aws_apigatewayv2_integration.visitor_counter_lambda.id}"
}

resource "aws_apigatewayv2_route" "visitor_counter_options" {
  api_id    = aws_apigatewayv2_api.this.id
  route_key = "OPTIONS /counter"
  target    = "integrations/${aws_apigatewayv2_integration.visitor_counter_lambda.id}"
}

resource "aws_lambda_permission" "allow_apigateway_visitor_counter" {
  statement_id  = "AllowExecutionFromApiGatewayVisitorCounter"
  action        = "lambda:InvokeFunction"
  function_name = var.visitor_counter_lambda_function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.this.execution_arn}/*/*/counter"
}