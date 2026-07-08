data "archive_file" "lambda_zip" {
  type        = "zip"
  source_file = var.lambda_source_file
  output_path = var.lambda_output_path
}

resource "aws_dynamodb_table" "admin_users" {
  name         = "${var.project_name}-${var.environment}-admin-users"
  billing_mode = "PAY_PER_REQUEST"

  hash_key = "username"

  attribute {
    name = "username"
    type = "S"
  }

  point_in_time_recovery {
    enabled = true
  }

  tags = {
    Project     = var.project_name
    Environment = var.environment
    ManagedBy   = "Terraform"
    Feature     = "AdminAuthentication"
  }
}

resource "aws_iam_role" "lambda_role" {
  name = "${var.project_name}-${var.environment}-admin-auth-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Principal = {
          Service = "lambda.amazonaws.com"
        }
        Action = "sts:AssumeRole"
      }
    ]
  })

  tags = {
    Project     = var.project_name
    Environment = var.environment
    ManagedBy   = "Terraform"
    Feature     = "AdminAuthentication"
  }
}

resource "aws_iam_policy" "lambda_policy" {
  name = "${var.project_name}-${var.environment}-admin-auth-policy"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "dynamodb:GetItem",
          "dynamodb:PutItem",
          "dynamodb:UpdateItem",
          "dynamodb:Scan"
        ]
        Resource = aws_dynamodb_table.admin_users.arn
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
  function_name = "${var.project_name}-${var.environment}-admin-auth"
  role          = aws_iam_role.lambda_role.arn
  handler       = "app.lambda_handler"
  runtime       = "python3.12"

  filename         = data.archive_file.lambda_zip.output_path
  source_code_hash = data.archive_file.lambda_zip.output_base64sha256

  timeout     = 10
  memory_size = 128

  environment {
    variables = {
      TABLE_NAME      = aws_dynamodb_table.admin_users.name
      ALLOWED_ORIGINS = var.allowed_origins
    }
  }

  tags = {
    Project     = var.project_name
    Environment = var.environment
    ManagedBy   = "Terraform"
    Feature     = "AdminAuthentication"
  }

  depends_on = [
    data.archive_file.lambda_zip,
    aws_iam_role_policy_attachment.lambda_policy_attachment
  ]
}

resource "aws_cloudwatch_log_group" "this" {
  name              = "/aws/lambda/${aws_lambda_function.this.function_name}"
  retention_in_days = 7

  tags = {
    Project     = var.project_name
    Environment = var.environment
    ManagedBy   = "Terraform"
    Feature     = "AdminAuthentication"
  }
}