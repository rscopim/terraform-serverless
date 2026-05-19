output "certificate_arn" {
  value = aws_acm_certificate_validation.this.certificate_arn
}

output "certificate_domain_name" {
  value = aws_acm_certificate.this.domain_name
}