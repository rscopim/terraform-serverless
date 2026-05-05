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
  block_public_policy     = false
  restrict_public_buckets = false
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

resource "aws_s3_bucket_policy" "public_read" {
  bucket = aws_s3_bucket.this.id

  depends_on = [
    aws_s3_bucket_public_access_block.this
  ]

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "PublicReadForStaticWebsite"
        Effect = "Allow"

        Principal = "*"

        Action = [
          "s3:GetObject"
        ]

        Resource = "${aws_s3_bucket.this.arn}/*"
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