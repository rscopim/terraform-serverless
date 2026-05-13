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

  project_name    = var.project_name
  environment     = var.environment
  bucket_name     = "materiais-e-trilhas-de-estudos"
  index_file_path = "${path.root}/../../static_site/index.html"
  style_file_path = "${path.root}/../../static_site/style.css"
  materials_path  = "${path.root}/../../static_site/materiais"
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