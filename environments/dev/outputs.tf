output "lambda_function_name" {
  description = "Nome da função Lambda principal"
  value       = module.hello_lambda.lambda_function_name
}

output "lambda_function_arn" {
  description = "ARN da função Lambda principal"
  value       = module.hello_lambda.lambda_function_arn
}

output "sqs_queue_url" {
  description = "URL da fila SQS principal"
  value       = module.sqs.queue_url
}

output "sqs_queue_arn" {
  description = "ARN da fila SQS principal"
  value       = module.sqs.queue_arn
}

output "sqs_dlq_arn" {
  description = "ARN da Dead Letter Queue"
  value       = module.sqs.dlq_arn
}

output "sns_topic_arn" {
  description = "ARN do tópico SNS"
  value       = module.sns.topic_arn
}

output "eventbridge_rule_name" {
  description = "Nome da regra principal do EventBridge"
  value       = module.eventbridge.rule_name
}

output "eventbridge_pdf_download_rule_name" {
  description = "Nome da regra EventBridge para downloads de PDFs"
  value       = module.eventbridge.pdf_download_rule_name
}

output "eventbridge_pdf_download_rule_arn" {
  description = "ARN da regra EventBridge para downloads de PDFs"
  value       = module.eventbridge.pdf_download_rule_arn
}

output "download_metrics_lambda_name" {
  description = "Nome da Lambda de métricas de downloads"
  value       = module.download_metrics.lambda_function_name
}

output "download_metrics_lambda_arn" {
  description = "ARN da Lambda de métricas de downloads"
  value       = module.download_metrics.lambda_function_arn
}

output "static_site_bucket_name" {
  description = "Nome do bucket do portal de estudos"
  value       = module.s3_static_site.bucket_name
}

output "static_site_url" {
  description = "URL do portal de estudos"
  value       = module.s3_static_site.website_url
}

output "cloudwatch_dashboard_name" {
  description = "Nome do dashboard de downloads no CloudWatch"
  value       = module.cloudwatch_dashboard.dashboard_name
}

output "leads_table_name" {
  description = "Nome da tabela DynamoDB de leads"
  value       = module.dynamodb_leads.table_name
}

output "register_lead_lambda_name" {
  description = "Nome da Lambda de registro de leads"
  value       = module.register_lead_lambda.lambda_function_name
}

output "leads_api_endpoint" {
  description = "Endpoint da API para cadastro de leads"
  value       = module.api_gateway.leads_endpoint
}

output "route53_zone_id" {
  description = "ID da Hosted Zone no Route 53"
  value       = module.route53.zone_id
}

output "route53_name_servers" {
  description = "Name servers gerados pelo Route 53"
  value       = module.route53.name_servers
}

output "acm_certificate_arn" {
  description = "ARN do certificado ACM validado em us-east-1"
  value       = module.acm.certificate_arn
}