output "rule_name" {
  value = aws_cloudwatch_event_rule.this.name
}

output "pdf_download_rule_arn" {
  value = aws_cloudwatch_event_rule.pdf_download.arn
}

output "pdf_download_rule_name" {
  value = aws_cloudwatch_event_rule.pdf_download.name
}