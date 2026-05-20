resource "aws_s3_bucket" "this" {
  bucket = var.bucket_name

  tags = {
    Project     = var.project_name
    Environment = var.environment
    ManagedBy   = "Terraform"
  }
}

resource "aws_s3_bucket_public_access_block" "this" {
  bucket = aws_s3_bucket.this.id

  block_public_acls       = true
  ignore_public_acls      = true
  block_public_policy     = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_website_configuration" "this" {
  bucket = aws_s3_bucket.this.id

  index_document {
    suffix = "index.html"
  }

  error_document {
    key = "index.html"
  }
}

resource "aws_s3_bucket_policy""cloudfront_private" {
  bucket =  aws_s3_bucket.this.id
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid = "AllowCloudFront"

        Effect = "Allow"

        Principal = {Service = "cloudfront.amazonaws.com"
        }

        Action = [
          "s3:GetObject"
        ]
        Resource = "${aws_s3_bucket.this.arn}/*"

        Condition = {
          StringEquals = {
            "AWS:SourceArn" = var.cloudfront_distribution_arn
          }
        }
      }
    ]
  })
}

resource "aws_s3_object" "index" {
  bucket       = aws_s3_bucket.this.id
  key          = "index.html"
  source       = var.index_file_path
  content_type = "text/html"

  etag = filemd5(var.index_file_path)
}

resource "aws_s3_object" "style" {
  bucket       = aws_s3_bucket.this.id
  key          = "style.css"
  source       = var.style_file_path
  content_type = "text/css"

  etag = filemd5(var.style_file_path)
}

resource "aws_s3_object" "pdfs" {
  for_each = fileset(var.materials_path, "*.pdf")

  bucket       = aws_s3_bucket.this.id
  key          = "materiais/${each.value}"
  source       = "${var.materials_path}/${each.value}"
  content_type = "application/pdf"

  etag = filemd5("${var.materials_path}/${each.value}")
}

resource "aws_s3_object" "assets" {
  for_each = fileset("${path.root}/../../static_site/assets", "**/*")

  bucket = aws_s3_bucket.this.id
  key    = "assets/${each.value}"
  source = "${path.root}/../../static_site/assets/${each.value}"

  etag = filemd5("${path.root}/../../static_site/assets/${each.value}")

  content_type = lookup({
    svg  = "image/svg+xml"
    png  = "image/png"
    jpg  = "image/jpeg"
    jpeg = "image/jpeg"
    ico  = "image/x-icon"
    webp = "image/webp"
  }, lower(element(split(".", each.value), length(split(".", each.value)) - 1)), "application/octet-stream")
}