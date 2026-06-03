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

resource "aws_cloudwatch_event_rule" "pdf_download" {
  name        = "${var.project_name}-${var.environment}-pdf-download"
  description = "Detecta downloads de arquivos no S3"
  state       = "ENABLED"

  event_pattern = jsonencode({
    source      = ["aws.s3"]
    detail-type = ["AWS API Call via CloudTrail"]

    detail = {
      eventSource = ["s3.amazonaws.com"]
      eventName   = ["GetObject"]

      requestParameters = {
      bucketName        = [var.site_bucket_name]
      }
    }
  })
}

resource "aws_cloudwatch_event_target" "pdf_sns" {
  rule      = aws_cloudwatch_event_rule.pdf_download.name
  target_id = "SendPdfNotification"
  arn       = var.sns_topic_arn
}

resource "aws_cloudwatch_event_target" "pdf_metrics_lambda" {
  rule      = aws_cloudwatch_event_rule.pdf_download.name
  target_id = "SendPdfDownloadToMetricsLambda"
  arn       = var.download_metrics_lambda_arn
}