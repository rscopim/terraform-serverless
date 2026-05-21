output "dashboard_name" {
  value = aws_cloudwatch_dashboard.this.dashboard_name
}

output "critical_alarm_names" {
  value = [
    aws_cloudwatch_metric_alarm.register_lead_lambda_errors.alarm_name,
    aws_cloudwatch_metric_alarm.download_metrics_lambda_errors.alarm_name,
    aws_cloudwatch_metric_alarm.api_gateway_5xx.alarm_name,
    aws_cloudwatch_metric_alarm.dynamodb_write_throttle.alarm_name,
    aws_cloudwatch_metric_alarm.sqs_dlq_messages.alarm_name,
    aws_cloudwatch_metric_alarm.sns_notifications_failed.alarm_name,
    aws_cloudwatch_metric_alarm.cloudfront_5xx_error_rate.alarm_name
  ]
}