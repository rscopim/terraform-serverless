output "table_name" {
  description = "Nome da tabela de progresso dos alunos"
  value       = aws_dynamodb_table.this.name
}

output "table_arn" {
  description = "ARN da tabela de progresso dos alunos"
  value       = aws_dynamodb_table.this.arn
}
