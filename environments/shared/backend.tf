terraform {
  backend "s3" {
    bucket  = "terraform-serverless-projeto-trilhas"
    key     = "environments/shared/terraform.tfstate"
    region  = "us-west-2"
    encrypt = true
  }
}