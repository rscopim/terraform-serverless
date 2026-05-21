data "aws_caller_identity" "current" {}

resource "aws_iam_openid_connect_provider" "github" {
  url = "https://token.actions.githubusercontent.com"

  client_id_list = [
    "sts.amazonaws.com"
  ]

  thumbprint_list = [
    "6938fd4d98bab03faadb97b34396831e3780aea1"
  ]

  tags = {
    Project     = var.project_name
    Environment = var.environment
    ManagedBy   = "Terraform"
  }
}

data "aws_iam_policy_document" "github_actions_assume_role" {
  statement {
    effect = "Allow"

    principals {
      type = "Federated"
      identifiers = [
        aws_iam_openid_connect_provider.github.arn
      ]
    }

    actions = [
      "sts:AssumeRoleWithWebIdentity"
    ]

    condition {
      test     = "StringEquals"
      variable = "token.actions.githubusercontent.com:aud"
      values = [
        "sts.amazonaws.com"
      ]
    }

    condition {
      test     = "StringLike"
      variable = "token.actions.githubusercontent.com:sub"
      values = [
        "repo:${var.github_owner}/${var.github_repository}:ref:refs/heads/${var.github_branch}"
      ]
    }
  }
}

resource "aws_iam_role" "github_actions" {
  name = "${var.project_name}-${var.environment}-github-actions-role"

  assume_role_policy = data.aws_iam_policy_document.github_actions_assume_role.json

  tags = {
    Project     = var.project_name
    Environment = var.environment
    ManagedBy   = "Terraform"
  }
}

resource "aws_iam_policy" "terraform_plan_read_only" {
  name        = "${var.project_name}-${var.environment}-terraform-plan-read-only"
  description = "Permissoes para GitHub Actions executar terraform plan com leitura dos recursos AWS"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "apigateway:*GET*",
          "apigateway:GET",

          "lambda:Get*",
          "lambda:List*",

          "dynamodb:Describe*",
          "dynamodb:List*",

          "s3:Get*",
          "s3:List*",

          "cloudfront:Get*",
          "cloudfront:List*",

          "route53:Get*",
          "route53:List*",

          "acm:Describe*",
          "acm:List*",

          "cloudwatch:Describe*",
          "cloudwatch:Get*",
          "cloudwatch:List*",

          "logs:Describe*",
          "logs:Get*",
          "logs:List*",

          "events:Describe*",
          "events:List*",

          "sns:Get*",
          "sns:List*",

          "sqs:Get*",
          "sqs:List*",

          "cloudtrail:Get*",
          "cloudtrail:List*",
          "cloudtrail:Describe*",

          "iam:Get*",
          "iam:List*",

          "budgets:ViewBudget"
        ]
        Resource = "*"
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "terraform_plan_read_only" {
  role       = aws_iam_role.github_actions.name
  policy_arn = aws_iam_policy.terraform_plan_read_only.arn
}