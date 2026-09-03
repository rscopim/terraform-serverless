#####################################################################
# Cognito Post Confirmation Lambda
#
# Trigger executado quando um aluno confirma o cadastro no Cognito.
# Grava o lead na tabela Terraform-Serverless-prod-leads.
#####################################################################

data "archive_file" "lambda_zip" {
  type        = "zip"
  source_file = var.lambda_source_file
  output_path = var.lambda_output_path
}

resource "aws_iam_role" "lambda_role" {
  name = "${var.project_name}-${var.environment}-cognito-postconfirm-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect    = "Allow"
        Principal = { Service = "lambda.amazonaws.com" }
        Action    = "sts:AssumeRole"
      }
    ]
  })

  tags = {
    Project     = var.project_name
    Environment = var.environment
    ManagedBy   = "Terraform"
    Feature     = "CognitoPostConfirmation"
  }
}

resource "aws_iam_policy" "lambda_policy" {
  name = "${var.project_name}-${var.environment}-cognito-postconfirm-policy"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect   = "Allow"
        Action   = ["dynamodb:PutItem"]
        Resource = var.leads_table_arn
      },
      {
        Effect   = "Allow"
        Action   = ["sns:Publish"]
        Resource = var.sns_topic_arn
      },
      {
        Effect   = "Allow"
        Action   = ["cloudwatch:PutMetricData"]
        Resource = "*"
      },
      {
        Effect = "Allow"
        Action = [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents"
        ]
        Resource = "*"
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "lambda_policy_attachment" {
  role       = aws_iam_role.lambda_role.name
  policy_arn = aws_iam_policy.lambda_policy.arn
}

resource "aws_lambda_function" "this" {
  function_name = "${var.project_name}-${var.environment}-cognito-post-confirmation"
  role          = aws_iam_role.lambda_role.arn
  handler       = "app.lambda_handler"
  runtime       = "python3.12"

  filename         = data.archive_file.lambda_zip.output_path
  source_code_hash = data.archive_file.lambda_zip.output_base64sha256

  timeout     = 10
  memory_size = 128

  environment {
    variables = {
      LEADS_TABLE_NAME = var.leads_table_name
      SNS_TOPIC_ARN    = var.sns_topic_arn
    }
  }

  tags = {
    Project     = var.project_name
    Environment = var.environment
    ManagedBy   = "Terraform"
    Feature     = "CognitoPostConfirmation"
  }

  depends_on = [aws_iam_role_policy_attachment.lambda_policy_attachment]
}

resource "aws_cloudwatch_log_group" "this" {
  name              = "/aws/lambda/${aws_lambda_function.this.function_name}"
  retention_in_days = 7

  tags = {
    Project     = var.project_name
    Environment = var.environment
    ManagedBy   = "Terraform"
    Feature     = "CognitoPostConfirmation"
  }
}

# Permissão para o Cognito invocar a Lambda.
# Usamos um ARN de User Pool com curinga (userpool/*) para evitar dependência
# circular entre este módulo e o módulo cognito (que precisa do ARN desta Lambda
# para configurar o trigger). O escopo fica restrito à conta/região do projeto.
data "aws_caller_identity" "current" {}
data "aws_region" "current" {}

resource "aws_lambda_permission" "cognito_invoke" {
  statement_id  = "AllowCognitoInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.this.function_name
  principal     = "cognito-idp.amazonaws.com"
  source_arn    = "arn:aws:cognito-idp:${data.aws_region.current.name}:${data.aws_caller_identity.current.account_id}:userpool/*"
}
