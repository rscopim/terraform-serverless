terraform {
  backend "s3" {
    bucket  = "terraform-serverless-projeto-trilhas"
    key     = "environments/prod/terraform.tfstate"
    region  = "us-west-2"
    encrypt = true
  }
}