# ======================================================
# Pacotes ZIP das Lambdas
# ======================================================

data "archive_file" "admin_login_zip" {
  type        = "zip"
  source_file = var.admin_login_source_file
  output_path = var.admin_login_output_path
}

data "archive_file" "admin_users_zip" {
  type        = "zip"
  source_file = var.admin_users_source_file
  output_path = var.admin_users_output_path
}

# ======================================================
# DynamoDB — Usuários administrativos
# ======================================================

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
    Component   = "AdminUsers"
  }
}

# ======================================================
# DynamoDB — Sessões administrativas
#
# Armazena somente o hash do token.
# O atributo expires_at utiliza TTL para remoção
# automática de sessões expiradas.
# ======================================================

resource "aws_dynamodb_table" "admin_sessions" {
  name         = "${var.project_name}-${var.environment}-admin-sessions"
  billing_mode = "PAY_PER_REQUEST"

  hash_key = "token_hash"

  attribute {
    name = "token_hash"
    type = "S"
  }

  ttl {
    attribute_name = "expires_at"
    enabled        = true
  }

  point_in_time_recovery {
    enabled = true
  }

  tags = {
    Project     = var.project_name
    Environment = var.environment
    ManagedBy   = "Terraform"
    Feature     = "AdminAuthentication"
    Component   = "AdminSessions"
  }
}

# ======================================================
# IAM — Lambda Admin Login
# ======================================================

resource "aws_iam_role" "admin_login_role" {
  name = "${var.project_name}-${var.environment}-admin-login-role"

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
    Component   = "AdminLogin"
  }
}

resource "aws_iam_policy" "admin_login_policy" {
  name = "${var.project_name}-${var.environment}-admin-login-policy"

  policy = jsonencode({
    Version = "2012-10-17"

    Statement = [
      {
        Sid    = "ReadAndUpdateAdminUser"
        Effect = "Allow"

        Action = [
          "dynamodb:GetItem",
          "dynamodb:UpdateItem"
        ]

        Resource = aws_dynamodb_table.admin_users.arn
      },
      {
        Sid    = "CreateAdminSession"
        Effect = "Allow"

        Action = [
          "dynamodb:PutItem"
        ]

        Resource = aws_dynamodb_table.admin_sessions.arn
      },
      {
        Sid    = "WriteLambdaLogs"
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

  tags = {
    Project     = var.project_name
    Environment = var.environment
    ManagedBy   = "Terraform"
    Feature     = "AdminAuthentication"
    Component   = "AdminLogin"
  }
}

resource "aws_iam_role_policy_attachment" "admin_login_policy_attachment" {
  role       = aws_iam_role.admin_login_role.name
  policy_arn = aws_iam_policy.admin_login_policy.arn
}

# ======================================================
# IAM — Lambda Admin Users
# ======================================================

resource "aws_iam_role" "admin_users_role" {
  name = "${var.project_name}-${var.environment}-admin-users-role"

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
    Component   = "AdminUsers"
  }
}

resource "aws_iam_policy" "admin_users_policy" {
  name = "${var.project_name}-${var.environment}-admin-users-policy"

  policy = jsonencode({
    Version = "2012-10-17"

    Statement = [
      {
        Sid    = "ManageAdminUsers"
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
        Sid    = "ValidateAdminSession"
        Effect = "Allow"

        Action = [
          "dynamodb:GetItem"
        ]

        Resource = aws_dynamodb_table.admin_sessions.arn
      },
      {
        Sid    = "WriteLambdaLogs"
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

  tags = {
    Project     = var.project_name
    Environment = var.environment
    ManagedBy   = "Terraform"
    Feature     = "AdminAuthentication"
    Component   = "AdminUsers"
  }
}

resource "aws_iam_role_policy_attachment" "admin_users_policy_attachment" {
  role       = aws_iam_role.admin_users_role.name
  policy_arn = aws_iam_policy.admin_users_policy.arn
}

# ======================================================
# Lambda — Admin Login
# ======================================================

resource "aws_lambda_function" "admin_login" {
  function_name = "${var.project_name}-${var.environment}-admin-login"

  role    = aws_iam_role.admin_login_role.arn
  handler = "app.lambda_handler"
  runtime = "python3.12"

  filename         = data.archive_file.admin_login_zip.output_path
  source_code_hash = data.archive_file.admin_login_zip.output_base64sha256

  timeout     = 10
  memory_size = 128

  environment {
    variables = {
      USERS_TABLE     = aws_dynamodb_table.admin_users.name
      SESSIONS_TABLE  = aws_dynamodb_table.admin_sessions.name
      ALLOWED_ORIGINS = var.allowed_origins
    }
  }

  tags = {
    Project     = var.project_name
    Environment = var.environment
    ManagedBy   = "Terraform"
    Feature     = "AdminAuthentication"
    Component   = "AdminLogin"
  }

  depends_on = [
    aws_iam_role_policy_attachment.admin_login_policy_attachment
  ]
}

# ======================================================
# Lambda — Admin Users
# ======================================================

resource "aws_lambda_function" "admin_users" {
  function_name = "${var.project_name}-${var.environment}-admin-users"

  role    = aws_iam_role.admin_users_role.arn
  handler = "app.lambda_handler"
  runtime = "python3.12"

  filename         = data.archive_file.admin_users_zip.output_path
  source_code_hash = data.archive_file.admin_users_zip.output_base64sha256

  timeout     = 10
  memory_size = 128

  environment {
    variables = {
      USERS_TABLE     = aws_dynamodb_table.admin_users.name
      SESSIONS_TABLE  = aws_dynamodb_table.admin_sessions.name
      ALLOWED_ORIGINS = var.allowed_origins
    }
  }

  tags = {
    Project     = var.project_name
    Environment = var.environment
    ManagedBy   = "Terraform"
    Feature     = "AdminAuthentication"
    Component   = "AdminUsers"
  }

  depends_on = [
    aws_iam_role_policy_attachment.admin_users_policy_attachment
  ]
}

# ======================================================
# CloudWatch Logs — Admin Login
# ======================================================

resource "aws_cloudwatch_log_group" "admin_login" {
  name              = "/aws/lambda/${aws_lambda_function.admin_login.function_name}"
  retention_in_days = 7

  tags = {
    Project     = var.project_name
    Environment = var.environment
    ManagedBy   = "Terraform"
    Feature     = "AdminAuthentication"
    Component   = "AdminLogin"
  }
}

# ======================================================
# CloudWatch Logs — Admin Users
# ======================================================

resource "aws_cloudwatch_log_group" "admin_users" {
  name              = "/aws/lambda/${aws_lambda_function.admin_users.function_name}"
  retention_in_days = 7

  tags = {
    Project     = var.project_name
    Environment = var.environment
    ManagedBy   = "Terraform"
    Feature     = "AdminAuthentication"
    Component   = "AdminUsers"
  }
}