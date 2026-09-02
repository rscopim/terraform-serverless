#####################################################################
# Amazon Cognito — Autenticação de alunos da CloudTrilhas
#
# User Pool com login por e-mail, verificação por código no e-mail,
# política de senha, recuperação de senha e auto-cadastro (self sign-up).
# Client web público (SPA) sem client secret, para uso no site estático.
#####################################################################

resource "aws_cognito_user_pool" "this" {
  name = "${var.project_name}-${var.environment}-alunos"

  # Login pelo e-mail (em vez de username separado)
  username_attributes      = ["email"]
  auto_verified_attributes = ["email"]

  # Permite que o próprio aluno se cadastre
  admin_create_user_config {
    allow_admin_create_user_only = false
  }

  password_policy {
    minimum_length                   = 8
    require_lowercase                = true
    require_uppercase                = true
    require_numbers                  = true
    require_symbols                  = false
    temporary_password_validity_days = 7
  }

  # Verificação por código enviado ao e-mail
  verification_message_template {
    default_email_option = "CONFIRM_WITH_CODE"
    email_subject        = "CloudTrilhas — seu código de verificação"
    email_message        = "Bem-vindo(a) à CloudTrilhas! Seu código de verificação é {####}"
  }

  # Recuperação de senha via e-mail verificado
  account_recovery_setting {
    recovery_mechanism {
      name     = "verified_email"
      priority = 1
    }
  }

  # Atributo padrão: nome do aluno
  schema {
    name                = "name"
    attribute_data_type = "String"
    mutable             = true
    required            = true
    string_attribute_constraints {
      min_length = 1
      max_length = 100
    }
  }

  # Usa o e-mail do próprio Cognito para envio (free tier: 50 e-mails/dia).
  # Para volume maior, integrar com Amazon SES (ver variável use_ses).
  dynamic "email_configuration" {
    for_each = var.ses_source_arn == "" ? [1] : []
    content {
      email_sending_account = "COGNITO_DEFAULT"
    }
  }

  dynamic "email_configuration" {
    for_each = var.ses_source_arn != "" ? [1] : []
    content {
      email_sending_account = "DEVELOPER"
      source_arn            = var.ses_source_arn
      from_email_address    = var.ses_from_email
    }
  }

  tags = {
    Project     = var.project_name
    Environment = var.environment
    ManagedBy   = "Terraform"
    Feature     = "AuthAlunos"
  }
}

# Grupo padrão para alunos
resource "aws_cognito_user_group" "student" {
  name         = "student"
  description  = "Alunos da CloudTrilhas com acesso às trilhas"
  user_pool_id = aws_cognito_user_pool.this.id
}

# Client web público (SPA) — sem client secret
resource "aws_cognito_user_pool_client" "web" {
  name         = "${var.project_name}-${var.environment}-web"
  user_pool_id = aws_cognito_user_pool.this.id

  generate_secret = false

  explicit_auth_flows = [
    "ALLOW_USER_PASSWORD_AUTH",
    "ALLOW_REFRESH_TOKEN_AUTH",
  ]

  access_token_validity  = 60 # minutos
  id_token_validity      = 60 # minutos
  refresh_token_validity = 30 # dias
  token_validity_units {
    access_token  = "minutes"
    id_token      = "minutes"
    refresh_token = "days"
  }

  # Não vaza se um e-mail existe ou não (proteção contra enumeração)
  prevent_user_existence_errors = "ENABLED"

  supported_identity_providers = ["COGNITO"]
}
