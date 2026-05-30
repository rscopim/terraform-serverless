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

resource "aws_s3_bucket_policy" "cloudfront_private" {
  bucket = aws_s3_bucket.this.id
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid = "AllowCloudFront"

        Effect = "Allow"

        Principal = { Service = "cloudfront.amazonaws.com"
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

resource "aws_s3_object" "app_js" {
  bucket       = aws_s3_bucket.this.id
  key          = "app.js"
  source       = "${path.root}/../../static_site/app.js"
  etag         = filemd5("${path.root}/../../static_site/app.js")
  content_type = "application/javascript"
}

resource "aws_s3_object" "linux_training_css" {
  bucket       = aws_s3_bucket.this.id
  key          = "linux-training.css"
  source       = "${path.root}/../../static_site/linux-training.css"
  etag         = filemd5("${path.root}/../../static_site/linux-training.css")
  content_type = "text/css"
}

resource "aws_s3_object" "index" {
  bucket       = aws_s3_bucket.this.id
  key          = "index.html"
  source       = var.index_file_path
  content_type = "text/html"

  etag = filemd5(var.index_file_path)
}

resource "aws_s3_object" "aws_page" {
  bucket       = aws_s3_bucket.this.id
  key          = "aws.html"
  source       = "${path.root}/../../static_site/aws.html"
  etag         = filemd5("${path.root}/../../static_site/aws.html")
  content_type = "text/html"
}

resource "aws_s3_object" "cloud_practitioner_page" {
  bucket       = aws_s3_bucket.this.id
  key          = "cloud-practitioner.html"
  source       = "${path.root}/../../static_site/cloud-practitioner.html"
  etag         = filemd5("${path.root}/../../static_site/cloud-practitioner.html")
  content_type = "text/html"
}

resource "aws_s3_object" "ai_practitioner_page" {
  bucket       = aws_s3_bucket.this.id
  key          = "ai-practitioner.html"
  source       = "${path.root}/../../static_site/ai-practitioner.html"
  etag         = filemd5("${path.root}/../../static_site/ai-practitioner.html")
  content_type = "text/html"
}

resource "aws_s3_object" "solutions_architect_page" {
  bucket       = aws_s3_bucket.this.id
  key          = "solutions-architect.html"
  source       = "${path.root}/../../static_site/solutions-architect.html"
  etag         = filemd5("${path.root}/../../static_site/solutions-architect.html")
  content_type = "text/html"
}

resource "aws_s3_object" "about_page" {
  bucket       = aws_s3_bucket.this.id
  key          = "about.html"
  source       = "${path.root}/../../static_site/about.html"
  etag         = filemd5("${path.root}/../../static_site/about.html")
  content_type = "text/html"
}

resource "aws_s3_object" "contact_page" {
  bucket       = aws_s3_bucket.this.id
  key          = "contact.html"
  source       = "${path.root}/../../static_site/contact.html"
  etag         = filemd5("${path.root}/../../static_site/contact.html")
  content_type = "text/html"
}

resource "aws_s3_object" "linux_page" {
  bucket       = aws_s3_bucket.this.id
  key          = "linux.html"
  source       = "${path.root}/../../static_site/linux.html"
  etag         = filemd5("${path.root}/../../static_site/linux.html")
  content_type = "text/html"
}

resource "aws_s3_object" "docker_page" {
  bucket       = aws_s3_bucket.this.id
  key          = "docker.html"
  source       = "${path.root}/../../static_site/docker.html"
  etag         = filemd5("${path.root}/../../static_site/docker.html")
  content_type = "text/html"
}

resource "aws_s3_object" "terraform_page" {
  bucket       = aws_s3_bucket.this.id
  key          = "terraform.html"
  source       = "${path.root}/../../static_site/terraform.html"
  etag         = filemd5("${path.root}/../../static_site/terraform.html")
  content_type = "text/html"
}

resource "aws_s3_object" "python_page" {
  bucket       = aws_s3_bucket.this.id
  key          = "python.html"
  source       = "${path.root}/../../static_site/python.html"
  etag         = filemd5("${path.root}/../../static_site/python.html")
  content_type = "text/html"
}

resource "aws_s3_object" "redes_page" {
  bucket       = aws_s3_bucket.this.id
  key          = "redes.html"
  source       = "${path.root}/../../static_site/redes.html"
  etag         = filemd5("${path.root}/../../static_site/redes.html")
  content_type = "text/html"
}

resource "aws_s3_object" "developer_page" {
  bucket       = aws_s3_bucket.this.id
  key          = "developer.html"
  source       = "${path.root}/../../static_site/developer.html"
  etag         = filemd5("${path.root}/../../static_site/developer.html")
  content_type = "text/html"
}

resource "aws_s3_object" "solutions_architect_pro_page" {
  bucket       = aws_s3_bucket.this.id
  key          = "solutions-architect-pro.html"
  source       = "${path.root}/../../static_site/solutions-architect-pro.html"
  etag         = filemd5("${path.root}/../../static_site/solutions-architect-pro.html")
  content_type = "text/html"
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


resource "aws_s3_object" "docker_modules" {
  for_each = fileset("${path.root}/../../static_site/docker", "*.html")

  bucket       = aws_s3_bucket.this.id
  key          = "docker/${each.value}"
  source       = "${path.root}/../../static_site/docker/${each.value}"
  content_type = "text/html"

  etag = filemd5("${path.root}/../../static_site/docker/${each.value}")
}

resource "aws_s3_object" "terraform_modules" {
  for_each = fileset("${path.root}/../../static_site/terraform", "*.html")

  bucket       = aws_s3_bucket.this.id
  key          = "terraform/${each.value}"
  source       = "${path.root}/../../static_site/terraform/${each.value}"
  content_type = "text/html"

  etag = filemd5("${path.root}/../../static_site/terraform/${each.value}")
}

resource "aws_s3_object" "ai_practitioner_modules" {
  for_each = fileset("${path.root}/../../static_site/ai-practitioner", "*.html")

  bucket       = aws_s3_bucket.this.id
  key          = "ai-practitioner/${each.value}"
  source       = "${path.root}/../../static_site/ai-practitioner/${each.value}"
  content_type = "text/html"

  etag = filemd5("${path.root}/../../static_site/ai-practitioner/${each.value}")
}

resource "aws_s3_object" "linux_modules" {
  for_each = fileset("${path.root}/../../static_site/linux", "*.html")

  bucket       = aws_s3_bucket.this.id
  key          = "linux/${each.value}"
  source       = "${path.root}/../../static_site/linux/${each.value}"
  content_type = "text/html"

  etag = filemd5("${path.root}/../../static_site/linux/${each.value}")
}

resource "aws_s3_object" "github_modules" {
  for_each = fileset("${path.root}/../../static_site/github", "*.html")

  bucket       = aws_s3_bucket.this.id
  key          = "github/${each.value}"
  source       = "${path.root}/../../static_site/github/${each.value}"
  content_type = "text/html"

  etag = filemd5("${path.root}/../../static_site/github/${each.value}")
}

resource "aws_s3_object" "kubernetes_modules" {
  for_each = fileset("${path.root}/../../static_site/kubernetes", "*.html")

  bucket       = aws_s3_bucket.this.id
  key          = "kubernetes/${each.value}"
  source       = "${path.root}/../../static_site/kubernetes/${each.value}"
  content_type = "text/html"

  etag = filemd5("${path.root}/../../static_site/kubernetes/${each.value}")
}

resource "aws_s3_object" "github_page" {
  bucket       = aws_s3_bucket.this.id
  key          = "github.html"
  source       = "${path.root}/../../static_site/github.html"
  etag         = filemd5("${path.root}/../../static_site/github.html")
  content_type = "text/html"
}

resource "aws_s3_object" "kubernetes_page" {
  bucket       = aws_s3_bucket.this.id
  key          = "kubernetes.html"
  source       = "${path.root}/../../static_site/kubernetes.html"
  etag         = filemd5("${path.root}/../../static_site/kubernetes.html")
  content_type = "text/html"
}

resource "aws_s3_object" "cloudformation_page" {
  bucket       = aws_s3_bucket.this.id
  key          = "cloudformation.html"
  source       = "${path.root}/../../static_site/cloudformation.html"
  etag         = filemd5("${path.root}/../../static_site/cloudformation.html")
  content_type = "text/html"
}

resource "aws_s3_object" "redes_modules" {
  for_each = fileset("${path.root}/../../static_site/redes", "*.html")

  bucket       = aws_s3_bucket.this.id
  key          = "redes/${each.value}"
  source       = "${path.root}/../../static_site/redes/${each.value}"
  content_type = "text/html"

  etag = filemd5("${path.root}/../../static_site/redes/${each.value}")
}

resource "aws_s3_object" "python_modules" {
  for_each = fileset("${path.root}/../../static_site/python", "*.html")

  bucket       = aws_s3_bucket.this.id
  key          = "python/${each.value}"
  source       = "${path.root}/../../static_site/python/${each.value}"
  content_type = "text/html"

  etag = filemd5("${path.root}/../../static_site/python/${each.value}")
}

resource "aws_s3_object" "cloudformation_modules" {
  for_each = fileset("${path.root}/../../static_site/cloudformation", "*.html")

  bucket       = aws_s3_bucket.this.id
  key          = "cloudformation/${each.value}"
  source       = "${path.root}/../../static_site/cloudformation/${each.value}"
  content_type = "text/html"

  etag = filemd5("${path.root}/../../static_site/cloudformation/${each.value}")
}
