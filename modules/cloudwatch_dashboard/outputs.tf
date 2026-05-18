output "dashboard_name" {
  description = "Nome do dashboard CloudWatch"
  value       = aws_cloudwatch_dashboard.this.dashboard_name
}