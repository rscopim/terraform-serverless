output "analytics_function_name" {
  value = aws_lambda_function.analytics.function_name
}

output "report_function_name" {
  value = aws_lambda_function.report.function_name
}

output "analytics_endpoint" {
  value = "GET /analytics"
}
