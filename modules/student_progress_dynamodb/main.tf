#####################################################################
# DynamoDB — Progresso e histórico de simulados dos alunos
#
# Single-table simples: PK = student_id (email do Cognito).
# Guarda progresso por trilha/módulo e histórico de resultados de simulados.
#####################################################################

resource "aws_dynamodb_table" "this" {
  name         = "${var.project_name}-${var.environment}-student-progress"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "student_id"

  attribute {
    name = "student_id"
    type = "S"
  }

  point_in_time_recovery {
    enabled = true
  }

  tags = {
    Project     = var.project_name
    Environment = var.environment
    ManagedBy   = "Terraform"
    Feature     = "StudentProgress"
  }
}
