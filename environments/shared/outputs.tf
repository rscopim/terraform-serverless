output "github_actions_role_arn" {
  description = "ARN da role utilizada pelo GitHub Actions via OIDC"
  value       = module.github_actions_oidc.github_actions_role_arn
}