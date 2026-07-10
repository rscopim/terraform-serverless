data "aws_caller_identity" "current" {}

# ======================================================
# GitHub Actions — Provedor OIDC
# ======================================================

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

# ======================================================
# GitHub Actions — Política de confiança
# ======================================================

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
        "repo:${var.github_owner}/${var.github_repository}:ref:refs/heads/${var.github_branch}",
        "repo:${var.github_owner}/${var.github_repository}:environment:production",
        "repo:${var.github_owner}/${var.github_repository}:pull_request"
      ]
    }
  }
}

# ======================================================
# GitHub Actions — Role utilizada pelo pipeline
# ======================================================

resource "aws_iam_role" "github_actions" {
  name = "${var.project_name}-${var.environment}-github-actions-role"

  assume_role_policy = data.aws_iam_policy_document.github_actions_assume_role.json

  tags = {
    Project     = var.project_name
    Environment = var.environment
    ManagedBy   = "Terraform"
  }
}

# ======================================================
# Terraform State — Acesso ao backend remoto
# ======================================================

resource "aws_iam_policy" "terraform_state_access" {
  name        = "${var.project_name}-${var.environment}-terraform-state-access"
  description = "Permite acesso ao bucket remoto do Terraform State"

  policy = jsonencode({
    Version = "2012-10-17"

    Statement = [
      {
        Sid    = "TerraformStateBucketList"
        Effect = "Allow"

        Action = [
          "s3:ListBucket"
        ]

        Resource = "arn:aws:s3:::terraform-serverless-tfstate-830286960930-us-west-2"
      },
      {
        Sid    = "TerraformStateObjectAccess"
        Effect = "Allow"

        Action = [
          "s3:GetObject",
          "s3:PutObject",
          "s3:DeleteObject"
        ]

        Resource = "arn:aws:s3:::terraform-serverless-tfstate-830286960930-us-west-2/*"
      }
    ]
  })

  tags = {
    Project     = var.project_name
    Environment = var.environment
    ManagedBy   = "Terraform"
  }
}

# ======================================================
# Terraform Apply — Gerenciamento da infraestrutura
# ======================================================

resource "aws_iam_policy" "terraform_apply_cloudtrilhas" {
  name        = "${var.project_name}-${var.environment}-terraform-apply-cloudtrilhas"
  description = "Permissoes customizadas para GitHub Actions executar Terraform Apply do CloudTrilhas"

  policy = jsonencode({
    Version = "2012-10-17"

    Statement = [
      {
        Sid    = "LambdaManagement"
        Effect = "Allow"

        Action = [
          "lambda:*"
        ]

        Resource = "*"
      },
      {
        Sid    = "APIGatewayManagement"
        Effect = "Allow"

        Action = [
          "apigateway:*"
        ]

        Resource = "*"
      },
      {
        Sid    = "DynamoDBManagement"
        Effect = "Allow"

        Action = [
          "dynamodb:*"
        ]

        Resource = "*"
      },
      {
        Sid    = "S3Management"
        Effect = "Allow"

        Action = [
          "s3:*"
        ]

        Resource = "*"
      },
      {
        Sid    = "CloudFrontManagement"
        Effect = "Allow"

        Action = [
          "cloudfront:*"
        ]

        Resource = "*"
      },
      {
        Sid    = "Route53Management"
        Effect = "Allow"

        Action = [
          "route53:*"
        ]

        Resource = "*"
      },
      {
        Sid    = "ACMManagement"
        Effect = "Allow"

        Action = [
          "acm:*"
        ]

        Resource = "*"
      },
      {
        Sid    = "CloudWatchManagement"
        Effect = "Allow"

        Action = [
          "cloudwatch:*",
          "logs:*"
        ]

        Resource = "*"
      },
      {
        Sid    = "EventBridgeManagement"
        Effect = "Allow"

        Action = [
          "events:*"
        ]

        Resource = "*"
      },
      {
        Sid    = "SNSManagement"
        Effect = "Allow"

        Action = [
          "sns:*"
        ]

        Resource = "*"
      },
      {
        Sid    = "SQSManagement"
        Effect = "Allow"

        Action = [
          "sqs:*"
        ]

        Resource = "*"
      },
      {
        Sid    = "CloudTrailManagement"
        Effect = "Allow"

        Action = [
          "cloudtrail:*"
        ]

        Resource = "*"
      },
      {
        Sid    = "BudgetsManagement"
        Effect = "Allow"

        Action = [
          "budgets:*"
        ]

        Resource = "*"
      },

      # ==================================================
      # IAM — Leitura e listagem
      #
      # Algumas ações List não permitem restrição adequada
      # por ARN e precisam utilizar Resource = "*".
      # ==================================================

      {
        Sid    = "IAMReadAndList"
        Effect = "Allow"

        Action = [
          "iam:GetRole",
          "iam:GetRolePolicy",
          "iam:GetPolicy",
          "iam:GetPolicyVersion",
          "iam:GetInstanceProfile",
          "iam:GetOpenIDConnectProvider",

          "iam:ListRoles",
          "iam:ListPolicies",
          "iam:ListRolePolicies",
          "iam:ListAttachedRolePolicies",
          "iam:ListPolicyVersions",
          "iam:ListEntitiesForPolicy",
          "iam:ListRoleTags",
          "iam:ListPolicyTags",
          "iam:ListOpenIDConnectProviders",
          "iam:ListInstanceProfiles",
          "iam:ListInstanceProfilesForRole"
        ]

        Resource = "*"
      },

      # ==================================================
      # IAM — Gerenciamento das roles do projeto
      # ==================================================

      {
        Sid    = "IAMManageProjectRoles"
        Effect = "Allow"

        Action = [
          "iam:CreateRole",
          "iam:DeleteRole",
          "iam:UpdateAssumeRolePolicy",
          "iam:TagRole",
          "iam:UntagRole",
          "iam:AttachRolePolicy",
          "iam:DetachRolePolicy",
          "iam:PutRolePolicy",
          "iam:DeleteRolePolicy"
        ]

        Resource = "arn:aws:iam::${data.aws_caller_identity.current.account_id}:role/${var.project_name}-${var.environment}-*"
      },

      # ==================================================
      # IAM — Gerenciamento das policies do projeto
      # ==================================================

      {
        Sid    = "IAMManageProjectPolicies"
        Effect = "Allow"

        Action = [
          "iam:CreatePolicy",
          "iam:DeletePolicy",
          "iam:CreatePolicyVersion",
          "iam:DeletePolicyVersion",
          "iam:SetDefaultPolicyVersion",
          "iam:TagPolicy",
          "iam:UntagPolicy"
        ]

        Resource = "arn:aws:iam::${data.aws_caller_identity.current.account_id}:policy/${var.project_name}-${var.environment}-*"
      },

      # ==================================================
      # IAM PassRole
      #
      # Permite apenas roles do projeto e somente para
      # execução por funções AWS Lambda.
      # ==================================================

      {
        Sid    = "IAMPassProjectRolesToLambda"
        Effect = "Allow"

        Action = [
          "iam:PassRole"
        ]

        Resource = "arn:aws:iam::${data.aws_caller_identity.current.account_id}:role/${var.project_name}-${var.environment}-*"

        Condition = {
          StringEquals = {
            "iam:PassedToService" = "lambda.amazonaws.com"
          }
        }
      },

      # ==================================================
      # GitHub OIDC Provider
      # ==================================================

      {
        Sid    = "IAMManageGitHubOIDCProvider"
        Effect = "Allow"

        Action = [
          "iam:CreateOpenIDConnectProvider",
          "iam:DeleteOpenIDConnectProvider",
          "iam:GetOpenIDConnectProvider",
          "iam:ListOpenIDConnectProviders",
          "iam:TagOpenIDConnectProvider",
          "iam:UntagOpenIDConnectProvider",
          "iam:AddClientIDToOpenIDConnectProvider",
          "iam:RemoveClientIDFromOpenIDConnectProvider",
          "iam:UpdateOpenIDConnectProviderThumbprint"
        ]

        Resource = "*"
      },

      # ==================================================
      # STS — Identificação da conta e identidade atual
      # ==================================================

      {
        Sid    = "STSRead"
        Effect = "Allow"

        Action = [
          "sts:GetCallerIdentity"
        ]

        Resource = "*"
      }
    ]
  })

  tags = {
    Project     = var.project_name
    Environment = var.environment
    ManagedBy   = "Terraform"
  }
}

# ======================================================
# Anexos das policies à role do GitHub Actions
# ======================================================

resource "aws_iam_role_policy_attachment" "terraform_state_access" {
  role       = aws_iam_role.github_actions.name
  policy_arn = aws_iam_policy.terraform_state_access.arn
}

resource "aws_iam_role_policy_attachment" "terraform_apply_cloudtrilhas" {
  role       = aws_iam_role.github_actions.name
  policy_arn = aws_iam_policy.terraform_apply_cloudtrilhas.arn
}