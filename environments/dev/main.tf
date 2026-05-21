terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 6.0"
    }

    archive = {
      source  = "hashicorp/archive"
      version = "~> 2.7"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

provider "aws" {
  alias  = "use1"
  region = "us-east-1"
}

module "hello_lambda" {
  source = "../../modules/lambda"

  project_name       = var.project_name
  environment        = var.environment
  lambda_source_file = "${path.root}/../../lambda_src/hello_lambda/app.py"
  lambda_output_path = "${path.root}/hello_lambda.zip"
  sqs_queue_arn      = module.sqs.queue_arn
  sns_topic_arn      = module.sns.topic_arn
}

module "sqs" {
  source = "../../modules/sqs"

  project_name = var.project_name
  environment  = var.environment
}

module "sns" {
  source = "../../modules/sns"

  project_name = var.project_name
  environment  = var.environment
}

module "eventbridge" {
  source = "../../modules/eventbridge"

  project_name                = var.project_name
  environment                 = var.environment
  sqs_queue_arn               = module.sqs.queue_arn
  sns_topic_arn               = module.sns.topic_arn
  site_bucket_name            = module.s3_static_site.bucket_name
  download_metrics_lambda_arn = module.download_metrics.lambda_function_arn
}

module "s3_static_site" {
  source = "../../modules/s3_static_site"

  project_name = var.project_name
  environment  = var.environment
  bucket_name  = "materiais-e-trilhas-de-estudos"

  index_file_path             = "${path.root}/../../static_site/index.html"
  style_file_path             = "${path.root}/../../static_site/style.css"
  materials_path              = "${path.root}/../../static_site/materiais"
  cloudfront_distribution_arn = module.cloudfront.cloudfront_distribution_arn
}

module "cloudtrail" {
  source = "../../modules/cloudtrail"

  project_name      = var.project_name
  environment       = var.environment
  target_bucket_arn = module.s3_static_site.bucket_arn
}

module "download_metrics" {
  source = "../../modules/download_metrics"

  project_name       = var.project_name
  environment        = var.environment
  lambda_source_file = "${path.root}/../../lambda_src/download_metrics/app.py"
  lambda_output_path = "${path.root}/download_metrics.zip"

  eventbridge_rule_arn = module.eventbridge.pdf_download_rule_arn
}

module "cloudwatch_dashboard" {
  source = "../../modules/cloudwatch_dashboard"

  project_name = var.project_name
  environment  = var.environment
  aws_region   = var.aws_region

  bucket_name = module.s3_static_site.bucket_name
}

module "dynamodb_leads" {
  source = "../../modules/dynamodb"

  project_name = var.project_name
  environment  = var.environment
}

module "register_lead_lambda" {
  source = "../../modules/register_lead_lambda"

  project_name       = var.project_name
  environment        = var.environment
  lambda_source_file = "${path.root}/../../lambda_src/register_lead/app.py"
  lambda_output_path = "${path.root}/register_lead.zip"

  dynamodb_table_name = module.dynamodb_leads.table_name
  dynamodb_table_arn  = module.dynamodb_leads.table_arn

  pdf_url = "http://${module.s3_static_site.bucket_name}.s3-website-${var.aws_region}.amazonaws.com/materiais/orientacoes-gerais-aws-caf.pdf"
}

module "api_gateway" {
  source = "../../modules/api_gateway"

  project_name = var.project_name
  environment  = var.environment

  lambda_invoke_arn    = module.register_lead_lambda.lambda_invoke_arn
  lambda_function_name = module.register_lead_lambda.lambda_function_name
}

module "route53" {
  source = "../../modules/route53"

  project_name = var.project_name
  environment  = var.environment
  domain_name  = var.domain_name
}

module "acm" {
  source = "../../modules/acm"

  providers = {
    aws = aws.use1
  }

  project_name = var.project_name
  environment  = var.environment
  domain_name  = var.domain_name
  zone_id      = module.route53.zone_id
}

module "cloudfront" {
  source = "../../modules/cloudfront"

  project_name = var.project_name
  environment  = var.environment
  domain_name  = var.domain_name

  s3_bucket_regional_domain_name = module.s3_static_site.bucket_regional_domain_name
  acm_certificate_arn            = module.acm.certificate_arn
  route53_zone_id                = module.route53.zone_id
}

module "budget" {
  source = "../../modules/budget"

  project_name = var.project_name
  environment  = var.environment

  limit_amount = "10"

  notification_emails = [
    "ricardo.simines@gmail.com"
  ]
}

module "cloudwatch_operational" {
  source = "../../modules/cloudwatch_operational"

  project_name = var.project_name
  environment  = var.environment
  aws_region   = var.aws_region

  sns_topic_arn  = module.sns.topic_arn
  sns_topic_name = module.sns.topic_name

  register_lead_lambda_name    = module.register_lead_lambda.lambda_function_name
  download_metrics_lambda_name = module.download_metrics.lambda_function_name

  api_gateway_id = module.api_gateway.api_id

  dynamodb_table_name = module.dynamodb_leads.table_name

  sqs_queue_name = module.sqs.queue_name
  sqs_dlq_name   = module.sqs.dlq_name

  cloudfront_distribution_id = module.cloudfront.cloudfront_distribution_id
}

