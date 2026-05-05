output "bucket_name" {
  description = "Nome do bucket S3 do site"
  value       = aws_s3_bucket.this.bucket
}

output "website_endpoint" {
  description = "Endpoint do site estático"
  value       = aws_s3_bucket_website_configuration.this.website_endpoint
}

output "website_url" {
  description = "URL HTTP do site estático"
  value       = "http://${aws_s3_bucket_website_configuration.this.website_endpoint}"
}