resource "aws_apigatewayv2_api" "this" {
  name          = "${var.project_name}-${var.environment}-leads-api"
  protocol_type = "HTTP"

  cors_configuration {
    allow_headers = ["authorization", "content-type"]
    allow_methods = ["GET", "POST", "PATCH", "OPTIONS"]
    allow_origins = [
      "https://cloudtrilhas.com.br",
      "https://www.cloudtrilhas.com.br"
    ]

    max_age = 3600
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

resource "aws_apigatewayv2_integration" "costs_lambda" {
  api_id                 = aws_apigatewayv2_api.this.id
  integration_type       = "AWS_PROXY"
  integration_uri        = var.costs_lambda_invoke_arn
  payload_format_version = "2.0"
}

resource "aws_apigatewayv2_route" "costs_get" {
  api_id    = aws_apigatewayv2_api.this.id
  route_key = "GET /costs"
  target    = "integrations/${aws_apigatewayv2_integration.costs_lambda.id}"
}

resource "aws_apigatewayv2_route" "costs_options" {
  api_id    = aws_apigatewayv2_api.this.id
  route_key = "OPTIONS /costs"
  target    = "integrations/${aws_apigatewayv2_integration.costs_lambda.id}"
}

resource "aws_lambda_permission" "allow_apigateway_costs" {
  statement_id  = "AllowExecutionFromApiGatewayCosts"
  action        = "lambda:InvokeFunction"
  function_name = var.costs_lambda_function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.this.execution_arn}/*/*/costs"
}

resource "aws_apigatewayv2_integration" "governance_lambda" {
  api_id                 = aws_apigatewayv2_api.this.id
  integration_type       = "AWS_PROXY"
  integration_uri        = var.governance_lambda_invoke_arn
  payload_format_version = "2.0"
}

resource "aws_apigatewayv2_route" "governance_get" {
  api_id    = aws_apigatewayv2_api.this.id
  route_key = "GET /governance"
  target    = "integrations/${aws_apigatewayv2_integration.governance_lambda.id}"
}

resource "aws_apigatewayv2_route" "governance_options" {
  api_id    = aws_apigatewayv2_api.this.id
  route_key = "OPTIONS /governance"
  target    = "integrations/${aws_apigatewayv2_integration.governance_lambda.id}"
}

resource "aws_lambda_permission" "allow_apigateway_governance" {
  statement_id  = "AllowExecutionFromApiGatewayGovernance"
  action        = "lambda:InvokeFunction"
  function_name = var.governance_lambda_function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.this.execution_arn}/*/*/governance"
}

# ======================================================
# Fase 29 — Admin Authentication
# Integração da Lambda responsável pelo login.
# ======================================================

resource "aws_apigatewayv2_integration" "admin_login_lambda" {
  api_id                 = aws_apigatewayv2_api.this.id
  integration_type       = "AWS_PROXY"
  integration_uri        = var.admin_login_lambda_invoke_arn
  payload_format_version = "2.0"
}

resource "aws_apigatewayv2_route" "admin_login_post" {
  api_id    = aws_apigatewayv2_api.this.id
  route_key = "POST /auth/login"
  target    = "integrations/${aws_apigatewayv2_integration.admin_login_lambda.id}"
}

# ======================================================
# Fase 29 — Encerramento da sessão administrativa
# ======================================================

resource "aws_apigatewayv2_route" "admin_logout_post" {
  api_id    = aws_apigatewayv2_api.this.id
  route_key = "POST /auth/logout"
  target    = "integrations/${aws_apigatewayv2_integration.admin_login_lambda.id}"
}

resource "aws_lambda_permission" "allow_apigateway_admin_login" {
  statement_id  = "AllowExecutionFromApiGatewayAdminLogin"
  action        = "lambda:InvokeFunction"
  function_name = var.admin_login_lambda_function_name
  principal     = "apigateway.amazonaws.com"

  source_arn = "${aws_apigatewayv2_api.this.execution_arn}/*/POST/auth/*"
}

# ======================================================
# Fase 29 — Admin Authentication
# Integração da Lambda responsável pela gestão de usuários.
# ======================================================

resource "aws_apigatewayv2_integration" "admin_users_lambda" {
  api_id                 = aws_apigatewayv2_api.this.id
  integration_type       = "AWS_PROXY"
  integration_uri        = var.admin_users_lambda_invoke_arn
  payload_format_version = "2.0"
}

resource "aws_apigatewayv2_route" "admin_users_get" {
  api_id    = aws_apigatewayv2_api.this.id
  route_key = "GET /auth/users"
  target    = "integrations/${aws_apigatewayv2_integration.admin_users_lambda.id}"
}

resource "aws_apigatewayv2_route" "admin_users_post" {
  api_id    = aws_apigatewayv2_api.this.id
  route_key = "POST /auth/users"
  target    = "integrations/${aws_apigatewayv2_integration.admin_users_lambda.id}"
}

resource "aws_apigatewayv2_route" "admin_users_patch" {
  api_id    = aws_apigatewayv2_api.this.id
  route_key = "PATCH /auth/users/{username}"
  target    = "integrations/${aws_apigatewayv2_integration.admin_users_lambda.id}"
}

resource "aws_lambda_permission" "allow_apigateway_admin_users" {
  statement_id  = "AllowExecutionFromApiGatewayAdminUsers"
  action        = "lambda:InvokeFunction"
  function_name = var.admin_users_lambda_function_name
  principal     = "apigateway.amazonaws.com"

  source_arn = "${aws_apigatewayv2_api.this.execution_arn}/*/*/auth/users*"
}

# ======================================================
# Progresso do Aluno (Dashboard) — rotas /progress
# ======================================================

resource "aws_apigatewayv2_integration" "student_progress_lambda" {
  api_id                 = aws_apigatewayv2_api.this.id
  integration_type       = "AWS_PROXY"
  integration_uri        = var.student_progress_lambda_invoke_arn
  payload_format_version = "2.0"
}

resource "aws_apigatewayv2_route" "progress_get" {
  api_id    = aws_apigatewayv2_api.this.id
  route_key = "GET /progress"
  target    = "integrations/${aws_apigatewayv2_integration.student_progress_lambda.id}"
}

resource "aws_apigatewayv2_route" "progress_post" {
  api_id    = aws_apigatewayv2_api.this.id
  route_key = "POST /progress"
  target    = "integrations/${aws_apigatewayv2_integration.student_progress_lambda.id}"
}

resource "aws_apigatewayv2_route" "progress_quiz_post" {
  api_id    = aws_apigatewayv2_api.this.id
  route_key = "POST /progress/quiz"
  target    = "integrations/${aws_apigatewayv2_integration.student_progress_lambda.id}"
}

resource "aws_apigatewayv2_route" "progress_origin_post" {
  api_id    = aws_apigatewayv2_api.this.id
  route_key = "POST /progress/origin"
  target    = "integrations/${aws_apigatewayv2_integration.student_progress_lambda.id}"
}

resource "aws_apigatewayv2_route" "progress_origin_options" {
  api_id    = aws_apigatewayv2_api.this.id
  route_key = "OPTIONS /progress/origin"
  target    = "integrations/${aws_apigatewayv2_integration.student_progress_lambda.id}"
}

resource "aws_apigatewayv2_route" "progress_options" {
  api_id    = aws_apigatewayv2_api.this.id
  route_key = "OPTIONS /progress"
  target    = "integrations/${aws_apigatewayv2_integration.student_progress_lambda.id}"
}

resource "aws_apigatewayv2_route" "progress_quiz_options" {
  api_id    = aws_apigatewayv2_api.this.id
  route_key = "OPTIONS /progress/quiz"
  target    = "integrations/${aws_apigatewayv2_integration.student_progress_lambda.id}"
}

resource "aws_lambda_permission" "allow_apigateway_student_progress" {
  statement_id  = "AllowExecutionFromApiGatewayStudentProgress"
  action        = "lambda:InvokeFunction"
  function_name = var.student_progress_lambda_function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.this.execution_arn}/*/*/progress*"
}
