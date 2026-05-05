resource "aws_cloudwatch_event_rule" "this" {
  name        = "${var.project_name}-${var.environment}-rule"
  description = "Regra para capturar eventos customizados"

  event_pattern = jsonencode({
    source = ["app.serverless"]
  })
}

resource "aws_cloudwatch_event_target" "sqs" {
  rule      = aws_cloudwatch_event_rule.this.name
  target_id = "SendToSQS"
  arn       = var.sqs_queue_arn
}