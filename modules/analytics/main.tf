data "archive_file" "lambda_zip" {
  type        = "zip"
  source_file = var.lambda_source_file
  output_path = var.lambda_output_path
}

resource "aws_iam_role" "lambda_role" {
  name = "${var.project_name}-${var.environment}-analytics-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = "sts:AssumeRole"
        Principal = {
          Service = "lambda.amazonaws.com"
        }
      }
    ]
  })

  tags = {
    Project     = var.project_name
    Environment = var.environment
    ManagedBy   = "Terraform"
    Feature     = "Analytics"
  }
}

resource "aws_iam_role_policy_attachment" "basic_execution" {
  role       = aws_iam_role.lambda_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

resource "aws_iam_role_policy" "analytics_policy" {
  name = "${var.project_name}-${var.environment}-analytics-policy"
  role = aws_iam_role.lambda_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid      = "ReadAnalyticsData"
        Effect   = "Allow"
        Action   = ["dynamodb:Scan"]
        Resource = var.dynamodb_table_arn
      },
      {
        Sid      = "PublishWeeklyReport"
        Effect   = "Allow"
        Action   = ["sns:Publish"]
        Resource = var.sns_topic_arn
      }
    ]
  })
}

resource "aws_lambda_function" "analytics" {
  function_name = "${var.project_name}-${var.environment}-analytics"
  role          = aws_iam_role.lambda_role.arn
  handler       = "app.lambda_handler"
  runtime       = "python3.12"

  filename         = data.archive_file.lambda_zip.output_path
  source_code_hash = data.archive_file.lambda_zip.output_base64sha256

  timeout     = 30
  memory_size = 256

  environment {
    variables = {
      LEADS_TABLE_NAME = var.dynamodb_table_name
      SNS_TOPIC_ARN    = var.sns_topic_arn
    }
  }

  tags = {
    Project     = var.project_name
    Environment = var.environment
    ManagedBy   = "Terraform"
    Feature     = "Analytics"
  }

  depends_on = [
    aws_iam_role_policy_attachment.basic_execution,
    aws_iam_role_policy.analytics_policy
  ]
}

resource "aws_lambda_function" "report" {
  function_name = "${var.project_name}-${var.environment}-analytics-report"
  role          = aws_iam_role.lambda_role.arn
  handler       = "app.report_handler"
  runtime       = "python3.12"

  filename         = data.archive_file.lambda_zip.output_path
  source_code_hash = data.archive_file.lambda_zip.output_base64sha256

  timeout     = 30
  memory_size = 256

  environment {
    variables = {
      LEADS_TABLE_NAME = var.dynamodb_table_name
      SNS_TOPIC_ARN    = var.sns_topic_arn
    }
  }

  tags = {
    Project     = var.project_name
    Environment = var.environment
    ManagedBy   = "Terraform"
    Feature     = "AnalyticsReport"
  }

  depends_on = [
    aws_iam_role_policy_attachment.basic_execution,
    aws_iam_role_policy.analytics_policy
  ]
}

resource "aws_apigatewayv2_integration" "analytics" {
  api_id                 = var.api_gateway_id
  integration_type       = "AWS_PROXY"
  integration_uri        = aws_lambda_function.analytics.invoke_arn
  payload_format_version = "2.0"
}

resource "aws_apigatewayv2_route" "analytics" {
  api_id    = var.api_gateway_id
  route_key = "GET /analytics"
  target    = "integrations/${aws_apigatewayv2_integration.analytics.id}"
}

resource "aws_lambda_permission" "allow_apigateway" {
  statement_id  = "AllowAPIGatewayInvokeAnalytics"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.analytics.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${var.api_gateway_execution_arn}/*/GET/analytics"
}

resource "aws_cloudwatch_event_rule" "weekly_report" {
  name                = "${var.project_name}-${var.environment}-weekly-analytics-report"
  description         = "Dispara relatório semanal de analytics toda segunda-feira"
  schedule_expression = "cron(0 8 ? * MON *)"

  tags = {
    Project     = var.project_name
    Environment = var.environment
    ManagedBy   = "Terraform"
    Feature     = "AnalyticsReport"
  }
}

resource "aws_cloudwatch_event_target" "report_lambda" {
  rule      = aws_cloudwatch_event_rule.weekly_report.name
  target_id = "analytics-report-lambda"
  arn       = aws_lambda_function.report.arn
}

resource "aws_lambda_permission" "allow_eventbridge" {
  statement_id  = "AllowEventBridgeInvokeAnalyticsReport"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.report.function_name
  principal     = "events.amazonaws.com"
  source_arn    = aws_cloudwatch_event_rule.weekly_report.arn
}
