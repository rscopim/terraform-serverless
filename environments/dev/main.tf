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
}

module "sqs" {
  source = "../../modules/sqs"

  project_name = var.project_name
  environment  = var.environment
}