output "cloudfront_distribution_id" {
  value = aws_cloudfront_distribution.this.id
}

output "cloudfront_domain_name" {
  value = aws_cloudfront_distribution.this.domain_name
}

output "website_url" {
  value = "https://${var.domain_name}"
}

output "www_website_url" {
  value = "https://www.${var.domain_name}"
}