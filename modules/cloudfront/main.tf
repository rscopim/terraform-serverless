resource "aws_cloudfront_origin_access_control" "this" {
  name                              = "${var.project_name}-${var.environment}-s3-oac"
  description                       = "OAC para acesso privado ao bucket S3 do portal CloudTrilhas"
  origin_access_control_origin_type = "s3"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}

resource "aws_cloudfront_function" "block_invalid_requests" {
  name    = "${var.project_name}-${var.environment}-block-invalid-requests"
  runtime = "cloudfront-js-2.0"
  comment = "Blocks bot crawlers, vulnerability scanners, and invalid path requests at the edge"
  publish = true
  code    = file("${path.module}/block-invalid-requests.js")
}

resource "aws_cloudfront_distribution" "this" {
  enabled             = true
  comment             = "CloudFront Distribution - ${var.domain_name}"
  default_root_object = "index.html"

  aliases = [
    var.domain_name,
    "www.${var.domain_name}"
  ]

  origin {
    domain_name              = var.s3_bucket_regional_domain_name
    origin_id                = "s3-private-origin"
    origin_access_control_id = aws_cloudfront_origin_access_control.this.id
  }

  default_cache_behavior {
    target_origin_id       = "s3-private-origin"
    viewer_protocol_policy = "redirect-to-https"

    allowed_methods = ["GET", "HEAD"]
    cached_methods  = ["GET", "HEAD"]

    compress = true

    min_ttl     = 0
    default_ttl = 86400
    max_ttl     = 604800

    forwarded_values {
      query_string = false

      cookies {
        forward = "none"
      }
    }

    function_association {
      event_type   = "viewer-request"
      function_arn = aws_cloudfront_function.block_invalid_requests.arn
    }
  }

  custom_error_response {
    error_code            = 404
    response_code         = 404
    response_page_path    = "/404.html"
    error_caching_min_ttl = 86400
  }

  restrictions {
    geo_restriction {
      restriction_type = "whitelist"

      locations = [
        "BR", # Brasil
        "CA", # Canadá
        "CL",  # Chile
        "PT" # Portugal
      ]
    }
  }

  viewer_certificate {
    acm_certificate_arn      = var.acm_certificate_arn
    ssl_support_method       = "sni-only"
    minimum_protocol_version = "TLSv1.2_2021"
  }

  tags = {
    Project     = var.project_name
    Environment = var.environment
    ManagedBy   = "Terraform"
  }
}

resource "aws_route53_record" "root" {
  zone_id = var.route53_zone_id
  name    = var.domain_name
  type    = "A"

  alias {
    name                   = aws_cloudfront_distribution.this.domain_name
    zone_id                = aws_cloudfront_distribution.this.hosted_zone_id
    evaluate_target_health = false
  }
}

resource "aws_route53_record" "www" {
  zone_id = var.route53_zone_id
  name    = "www.${var.domain_name}"
  type    = "A"

  alias {
    name                   = aws_cloudfront_distribution.this.domain_name
    zone_id                = aws_cloudfront_distribution.this.hosted_zone_id
    evaluate_target_health = false
  }
}