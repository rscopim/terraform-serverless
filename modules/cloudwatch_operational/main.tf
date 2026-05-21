resource "aws_cloudwatch_metric_alarm" "register_lead_lambda_errors" {
  alarm_name          = "${var.project_name}-${var.environment}-register-lead-lambda-errors"
  alarm_description   = "Alarme para erros na Lambda de captura de leads"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 1
  metric_name         = "Errors"
  namespace           = "AWS/Lambda"
  period              = 300
  statistic           = "Sum"
  threshold           = 0
  treat_missing_data  = "notBreaching"

  dimensions = {
    FunctionName = var.register_lead_lambda_name
  }

  alarm_actions = [var.sns_topic_arn]
}

resource "aws_cloudwatch_metric_alarm" "download_metrics_lambda_errors" {
  alarm_name          = "${var.project_name}-${var.environment}-download-metrics-lambda-errors"
  alarm_description   = "Alarme para erros na Lambda de métricas de downloads"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 1
  metric_name         = "Errors"
  namespace           = "AWS/Lambda"
  period              = 300
  statistic           = "Sum"
  threshold           = 0
  treat_missing_data  = "notBreaching"

  dimensions = {
    FunctionName = var.download_metrics_lambda_name
  }

  alarm_actions = [var.sns_topic_arn]
}

resource "aws_cloudwatch_metric_alarm" "api_gateway_5xx" {
  alarm_name          = "${var.project_name}-${var.environment}-api-gateway-5xx"
  alarm_description   = "Alarme para erros 5XX no API Gateway"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 1
  metric_name         = "5xx"
  namespace           = "AWS/ApiGateway"
  period              = 300
  statistic           = "Sum"
  threshold           = 0
  treat_missing_data  = "notBreaching"

  dimensions = {
    ApiId = var.api_gateway_id
  }

  alarm_actions = [var.sns_topic_arn]
}

resource "aws_cloudwatch_metric_alarm" "api_gateway_4xx" {
  alarm_name          = "${var.project_name}-${var.environment}-api-gateway-4xx"
  alarm_description   = "Alarme de atenção para erros 4XX no API Gateway"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 1
  metric_name         = "4xx"
  namespace           = "AWS/ApiGateway"
  period              = 300
  statistic           = "Sum"
  threshold           = 10
  treat_missing_data  = "notBreaching"

  dimensions = {
    ApiId = var.api_gateway_id
  }

  alarm_actions = [var.sns_topic_arn]
}

resource "aws_cloudwatch_metric_alarm" "dynamodb_write_throttle" {
  alarm_name          = "${var.project_name}-${var.environment}-dynamodb-write-throttle"
  alarm_description   = "Alarme para throttling de escrita no DynamoDB"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 1
  metric_name         = "WriteThrottleEvents"
  namespace           = "AWS/DynamoDB"
  period              = 300
  statistic           = "Sum"
  threshold           = 0
  treat_missing_data  = "notBreaching"

  dimensions = {
    TableName = var.dynamodb_table_name
  }

  alarm_actions = [var.sns_topic_arn]
}

resource "aws_cloudwatch_metric_alarm" "sqs_dlq_messages" {
  alarm_name          = "${var.project_name}-${var.environment}-sqs-dlq-messages"
  alarm_description   = "Alarme quando existirem mensagens na DLQ"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 1
  metric_name         = "ApproximateNumberOfMessagesVisible"
  namespace           = "AWS/SQS"
  period              = 300
  statistic           = "Maximum"
  threshold           = 0
  treat_missing_data  = "notBreaching"

  dimensions = {
    QueueName = var.sqs_dlq_name
  }

  alarm_actions = [var.sns_topic_arn]
}

resource "aws_cloudwatch_metric_alarm" "sns_notifications_failed" {
  alarm_name          = "${var.project_name}-${var.environment}-sns-notifications-failed"
  alarm_description   = "Alarme para falhas de entrega no SNS"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 1
  metric_name         = "NumberOfNotificationsFailed"
  namespace           = "AWS/SNS"
  period              = 300
  statistic           = "Sum"
  threshold           = 0
  treat_missing_data  = "notBreaching"

  dimensions = {
    TopicName = var.sns_topic_name
  }

  alarm_actions = [var.sns_topic_arn]
}

resource "aws_cloudwatch_metric_alarm" "cloudfront_5xx_error_rate" {
  alarm_name          = "${var.project_name}-${var.environment}-cloudfront-5xx-error-rate"
  alarm_description   = "Alarme para taxa de erro 5XX no CloudFront"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 1
  metric_name         = "5xxErrorRate"
  namespace           = "AWS/CloudFront"
  period              = 300
  statistic           = "Average"
  threshold           = 1
  treat_missing_data  = "notBreaching"

  dimensions = {
    DistributionId = var.cloudfront_distribution_id
    Region         = "Global"
  }

  alarm_actions = [var.sns_topic_arn]
}

resource "aws_cloudwatch_dashboard" "this" {
  dashboard_name = "${var.project_name}-${var.environment}-operational-dashboard"

  dashboard_body = jsonencode({
    widgets = [
      {
        type   = "text"
        x      = 0
        y      = 0
        width  = 24
        height = 2

        properties = {
          markdown = "# CloudTrilhas - Dashboard Operacional\nMonitoramento operacional com métricas padrão AWS."
        }
      },
      {
        type   = "metric"
        x      = 0
        y      = 2
        width  = 12
        height = 6

        properties = {
          title  = "CloudFront - Requests"
          region = "us-east-1"
          stat   = "Sum"
          period = 300
          view   = "timeSeries"

          metrics = [
            ["AWS/CloudFront", "Requests", "DistributionId", var.cloudfront_distribution_id, "Region", "Global"]
          ]
        }
      },
      {
        type   = "metric"
        x      = 12
        y      = 2
        width  = 12
        height = 6

        properties = {
          title  = "CloudFront - Error Rate"
          region = "us-east-1"
          stat   = "Average"
          period = 300
          view   = "timeSeries"

          metrics = [
            ["AWS/CloudFront", "4xxErrorRate", "DistributionId", var.cloudfront_distribution_id, "Region", "Global"],
            [".", "5xxErrorRate", ".", ".", ".", "."]
          ]
        }
      },
      {
        type   = "metric"
        x      = 0
        y      = 8
        width  = 12
        height = 6

        properties = {
          title  = "API Gateway - Requests"
          region = var.aws_region
          stat   = "Sum"
          period = 300
          view   = "timeSeries"

          metrics = [
            ["AWS/ApiGateway", "Count", "ApiId", var.api_gateway_id]
          ]
        }
      },
      {
        type   = "metric"
        x      = 12
        y      = 8
        width  = 12
        height = 6

        properties = {
          title  = "API Gateway - Errors"
          region = var.aws_region
          stat   = "Sum"
          period = 300
          view   = "timeSeries"

          metrics = [
            ["AWS/ApiGateway", "4xx", "ApiId", var.api_gateway_id],
            [".", "5xx", ".", "."]
          ]
        }
      },
      {
        type   = "metric"
        x      = 0
        y      = 14
        width  = 12
        height = 6

        properties = {
          title  = "Lambda - Errors"
          region = var.aws_region
          stat   = "Sum"
          period = 300
          view   = "timeSeries"

          metrics = [
            ["AWS/Lambda", "Errors", "FunctionName", var.register_lead_lambda_name],
            [".", ".", ".", var.download_metrics_lambda_name]
          ]
        }
      },
      {
        type   = "metric"
        x      = 12
        y      = 14
        width  = 12
        height = 6

        properties = {
          title  = "Lambda - Duration"
          region = var.aws_region
          stat   = "Average"
          period = 300
          view   = "timeSeries"

          metrics = [
            ["AWS/Lambda", "Duration", "FunctionName", var.register_lead_lambda_name],
            [".", ".", ".", var.download_metrics_lambda_name]
          ]
        }
      },
      {
        type   = "metric"
        x      = 0
        y      = 20
        width  = 12
        height = 6

        properties = {
          title  = "DynamoDB - Throttles"
          region = var.aws_region
          stat   = "Sum"
          period = 300
          view   = "timeSeries"

          metrics = [
            ["AWS/DynamoDB", "ReadThrottleEvents", "TableName", var.dynamodb_table_name],
            [".", "WriteThrottleEvents", ".", "."]
          ]
        }
      },
      {
        type   = "metric"
        x      = 12
        y      = 20
        width  = 12
        height = 6

        properties = {
          title  = "SQS / DLQ - Messages Visible"
          region = var.aws_region
          stat   = "Maximum"
          period = 300
          view   = "timeSeries"

          metrics = [
            ["AWS/SQS", "ApproximateNumberOfMessagesVisible", "QueueName", var.sqs_queue_name],
            [".", ".", ".", var.sqs_dlq_name]
          ]
        }
      },
      {
        type   = "metric"
        x      = 0
        y      = 26
        width  = 12
        height = 6

        properties = {
          title  = "SNS - Notifications Failed"
          region = var.aws_region
          stat   = "Sum"
          period = 300
          view   = "timeSeries"

          metrics = [
            ["AWS/SNS", "NumberOfNotificationsFailed", "TopicName", var.sns_topic_name]
          ]
        }
      },
      {
        type   = "metric"
        x      = 12
        y      = 26
        width  = 12
        height = 6

        properties = {
          title  = "PDF Downloads"
          region = var.aws_region
          stat   = "Sum"
          period = 300
          view   = "timeSeries"

          metrics = [
            [
              {
                expression = "SUM(SEARCH('{TerraformServerless/Downloads,BucketName,ObjectKey} MetricName=\"PDFDownloads\"', 'Sum', 300))"
                label      = "Downloads PDFs"
                id         = "e1"
              }
            ]
          ]
        }
      }
    ]
  })
}