resource "aws_cloudwatch_dashboard" "this" {
  dashboard_name = "${var.project_name}-${var.environment}-downloads-dashboard"

  dashboard_body = jsonencode({
    widgets = [
      {
        type   = "text"
        x      = 0
        y      = 0
        width  = 24
        height = 3

        properties = {
          markdown = "# Dashboard de Downloads\nMonitoramento dos downloads de PDFs do Portal de Estudos Cloud."
        }
      },

      # =========================================
      # DOWNLOADS DE PDFs (TIME SERIES)
      # =========================================

      {
        type   = "metric"
        x      = 0
        y      = 3
        width  = 12
        height = 6

        properties = {
          title   = "Downloads de PDFs"
          view    = "timeSeries"
          stacked = false
          region  = var.aws_region
          period  = 300
          stat    = "Sum"

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
      },

      # =========================================
      # TOTAL DE DOWNLOADS
      # =========================================

      {
        type   = "metric"
        x      = 12
        y      = 3
        width  = 12
        height = 6

        properties = {
          title  = "Total de Downloads"
          view   = "singleValue"
          region = var.aws_region
          period = 300
          stat   = "Sum"

          metrics = [
            [
              {
                expression = "SUM(SEARCH('{TerraformServerless/Downloads,BucketName,ObjectKey} MetricName=\"PDFDownloads\"', 'Sum', 300))"
                label      = "Total de Downloads"
                id         = "e1"
              }
            ]
          ]
        }
      },

      # =========================================
      # DOWNLOADS POR MATERIAL
      # =========================================

      {
        type   = "metric"
        x      = 0
        y      = 9
        width  = 24
        height = 6

        properties = {
          title   = "Downloads por Material"
          view    = "timeSeries"
          stacked = false
          region  = var.aws_region
          period  = 300
          stat    = "Sum"

          metrics = [
            [
              var.metric_namespace,
              "PDFDownloads",
              "BucketName",
              var.bucket_name,
              "ObjectKey",
              "materiais/orientacoes-gerais-aws-caf.pdf"
            ]
          ]
        }
      }
    ]
  })
}