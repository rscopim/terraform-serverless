output "queue_url" {
  description = "URL da fila SQS principal"
  value       = aws_sqs_queue.main.id
}

output "queue_arn" {
  description = "ARN da fila SQS principal"
  value       = aws_sqs_queue.main.arn
}

output "queue_name" {
  description = "Nome da fila SQS principal"
  value       = aws_sqs_queue.main.name
}

output "dlq_arn" {
  description = "ARN da Dead Letter Queue"
  value       = aws_sqs_queue.dlq.arn
}

output "dlq_name" {
  description = "Nome da Dead Letter Queue"
  value       = aws_sqs_queue.dlq.name
}