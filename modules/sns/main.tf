resource "aws_sns_topic" "this" {
  name = "${var.project_name}-${var.environment}-topic"

  tags = {
    Project     = var.project_name
    Environment = var.environment
  }
}