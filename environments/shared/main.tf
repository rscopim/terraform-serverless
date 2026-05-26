module "github_actions_oidc" {
  source = "../../modules/github_actions_oidc"

  project_name      = var.project_name
  environment       = var.environment
  github_owner      = "rscopim"
  github_repository = "terraform-serverless"
  github_branch     = "main"
}

module "budget" {
  source       = "../../modules/budget"
  project_name = var.project_name
  environment  = var.environment
  limit_amount = "10"
  notification_emails = [
    "ricardo.simines@gmail.com"
  ]
}