resource "aws_s3_bucket" "this" {
  bucket = var.bucket_name

  tags = {
    Project     = var.project_name
    Environment = var.environment
    ManagedBy   = "Terraform"
  }
}

# Desabilitar versionamento — site estático não precisa de versões
# (reduz custo de armazenamento drasticamente)
resource "aws_s3_bucket_versioning" "this" {
  bucket = aws_s3_bucket.this.id

  versioning_configuration {
    status = "Suspended"
  }
}

# Lifecycle: limpar versões antigas e uploads incompletos
resource "aws_s3_bucket_lifecycle_configuration" "this" {
  bucket = aws_s3_bucket.this.id

  # Deletar versões anteriores (non-current) após 1 dia
  rule {
    id     = "delete-old-versions"
    status = "Enabled"

    filter {
      prefix = ""
    }

    noncurrent_version_expiration {
      noncurrent_days = 1
    }
  }

  # Limpar delete markers órfãos
  rule {
    id     = "cleanup-delete-markers"
    status = "Enabled"

    filter {
      prefix = ""
    }

    expiration {
      expired_object_delete_marker = true
    }
  }

  # Abortar uploads multipart incompletos
  rule {
    id     = "abort-multipart"
    status = "Enabled"

    filter {
      prefix = ""
    }

    abort_incomplete_multipart_upload {
      days_after_initiation = 1
    }
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
  bucket        = aws_s3_bucket.this.id
  key           = "style.css"
  source        = var.style_file_path
  content_type  = "text/css"
  cache_control = "public, max-age=604800, immutable"

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

resource "aws_s3_object" "github_page" {
  bucket       = aws_s3_bucket.this.id
  key          = "github.html"
  source       = "${path.root}/../../static_site/github.html"
  etag         = filemd5("${path.root}/../../static_site/github.html")
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


resource "aws_s3_object" "developer_modules" {
  for_each = fileset("${path.root}/../../static_site/developer", "*.html")

  bucket       = aws_s3_bucket.this.id
  key          = "developer/${each.value}"
  source       = "${path.root}/../../static_site/developer/${each.value}"
  content_type = "text/html"

  etag = filemd5("${path.root}/../../static_site/developer/${each.value}")
}

resource "aws_s3_object" "sa_pro_modules" {
  for_each = fileset("${path.root}/../../static_site/solutions-architect-pro", "*.html")

  bucket       = aws_s3_bucket.this.id
  key          = "solutions-architect-pro/${each.value}"
  source       = "${path.root}/../../static_site/solutions-architect-pro/${each.value}"
  content_type = "text/html"

  etag = filemd5("${path.root}/../../static_site/solutions-architect-pro/${each.value}")
}

resource "aws_s3_object" "cloud_practitioner_modules" {
  for_each = fileset("${path.root}/../../static_site/cloud-practitioner", "*.html")

  bucket       = aws_s3_bucket.this.id
  key          = "cloud-practitioner/${each.value}"
  source       = "${path.root}/../../static_site/cloud-practitioner/${each.value}"
  content_type = "text/html"

  etag = filemd5("${path.root}/../../static_site/cloud-practitioner/${each.value}")
}

resource "aws_s3_object" "solutions_architect_modules" {
  for_each = fileset("${path.root}/../../static_site/solutions-architect", "*.html")

  bucket       = aws_s3_bucket.this.id
  key          = "solutions-architect/${each.value}"
  source       = "${path.root}/../../static_site/solutions-architect/${each.value}"
  content_type = "text/html"

  etag = filemd5("${path.root}/../../static_site/solutions-architect/${each.value}")
}

resource "aws_s3_object" "robots_txt" {
  bucket       = aws_s3_bucket.this.id
  key          = "robots.txt"
  source       = "${path.root}/../../static_site/robots.txt"
  content_type = "text/plain"
  etag         = filemd5("${path.root}/../../static_site/robots.txt")
}

resource "aws_s3_object" "simulado_css" {
  bucket       = aws_s3_bucket.this.id
  key          = "simulado.css"
  source       = "${path.root}/../../static_site/simulado.css"
  content_type = "text/css"
  etag         = filemd5("${path.root}/../../static_site/simulado.css")
}

resource "aws_s3_object" "simulado_js" {
  bucket       = aws_s3_bucket.this.id
  key          = "simulado.js"
  source       = "${path.root}/../../static_site/simulado.js"
  content_type = "application/javascript"
  etag         = filemd5("${path.root}/../../static_site/simulado.js")
}

resource "aws_s3_object" "config_js" {
  bucket = aws_s3_bucket.this.id
  key    = "config.js"

  content = <<EOT
window.CLOUDTRILHAS_CONFIG = {
  apiEndpoint: "${var.api_endpoint}",
  visitorCounterEndpoint: "${var.visitor_counter_endpoint}",
  progressEndpoint: "${var.progress_endpoint}",
  cognito: {
    region: "${var.cognito_region}",
    userPoolId: "${var.cognito_user_pool_id}",
    clientId: "${var.cognito_client_id}"
  }
};
EOT

  content_type  = "application/javascript"
  cache_control = "no-cache, no-store, must-revalidate"

  etag = md5(<<EOT
window.CLOUDTRILHAS_CONFIG = {
  apiEndpoint: "${var.api_endpoint}",
  visitorCounterEndpoint: "${var.visitor_counter_endpoint}",
  progressEndpoint: "${var.progress_endpoint}",
  cognito: {
    region: "${var.cognito_region}",
    userPoolId: "${var.cognito_user_pool_id}",
    clientId: "${var.cognito_client_id}"
  }
};
EOT
  )
}

resource "aws_s3_object" "sitemap_xml" {
  bucket       = aws_s3_bucket.this.id
  key          = "sitemap.xml"
  source       = "${path.root}/../../static_site/sitemap.xml"
  content_type = "application/xml"
  etag         = filemd5("${path.root}/../../static_site/sitemap.xml")
}

resource "aws_s3_object" "trail_gate_js" {
  bucket       = aws_s3_bucket.this.id
  key          = "trail-gate.js"
  source       = "${path.root}/../../static_site/trail-gate.js"
  content_type = "application/javascript"
  etag         = filemd5("${path.root}/../../static_site/trail-gate.js")
}

# Autenticação de alunos (Cognito) — biblioteca do frontend
resource "aws_s3_object" "auth_js" {
  bucket        = aws_s3_bucket.this.id
  key           = "auth.js"
  source        = "${path.root}/../../static_site/auth.js"
  content_type  = "application/javascript"
  cache_control = "no-cache, no-store, must-revalidate"
  etag          = filemd5("${path.root}/../../static_site/auth.js")
}

resource "aws_s3_object" "login_page" {
  bucket       = aws_s3_bucket.this.id
  key          = "login.html"
  source       = "${path.root}/../../static_site/login.html"
  content_type = "text/html"
  etag         = filemd5("${path.root}/../../static_site/login.html")
}

resource "aws_s3_object" "cadastro_page" {
  bucket       = aws_s3_bucket.this.id
  key          = "cadastro.html"
  source       = "${path.root}/../../static_site/cadastro.html"
  content_type = "text/html"
  etag         = filemd5("${path.root}/../../static_site/cadastro.html")
}

# Sandbox de prática (Pyodide) — client-side, custo zero
resource "aws_s3_object" "sandbox_page" {
  bucket       = aws_s3_bucket.this.id
  key          = "sandbox.html"
  source       = "${path.root}/../../static_site/sandbox.html"
  content_type = "text/html"
  etag         = filemd5("${path.root}/../../static_site/sandbox.html")
}

# Hub de sandboxes (tela de escolha entre Python, Linux e Redes)
resource "aws_s3_object" "sandboxes_hub_page" {
  bucket       = aws_s3_bucket.this.id
  key          = "sandboxes.html"
  source       = "${path.root}/../../static_site/sandboxes.html"
  content_type = "text/html"
  etag         = filemd5("${path.root}/../../static_site/sandboxes.html")
}

resource "aws_s3_object" "sandbox_js" {
  bucket       = aws_s3_bucket.this.id
  key          = "sandbox.js"
  source       = "${path.root}/../../static_site/sandbox.js"
  content_type = "application/javascript"
  etag         = filemd5("${path.root}/../../static_site/sandbox.js")
}

# Sandbox Linux (terminal simulado, client-side)
resource "aws_s3_object" "sandbox_linux_page" {
  bucket       = aws_s3_bucket.this.id
  key          = "sandbox-linux.html"
  source       = "${path.root}/../../static_site/sandbox-linux.html"
  content_type = "text/html"
  etag         = filemd5("${path.root}/../../static_site/sandbox-linux.html")
}

resource "aws_s3_object" "sandbox_linux_js" {
  bucket       = aws_s3_bucket.this.id
  key          = "sandbox-linux.js"
  source       = "${path.root}/../../static_site/sandbox-linux.js"
  content_type = "application/javascript"
  etag         = filemd5("${path.root}/../../static_site/sandbox-linux.js")
}

# Sandbox Redes (calculadora subnet/CIDR, roteamento, OSI, client-side)
resource "aws_s3_object" "sandbox_redes_page" {
  bucket       = aws_s3_bucket.this.id
  key          = "sandbox-redes.html"
  source       = "${path.root}/../../static_site/sandbox-redes.html"
  content_type = "text/html"
  etag         = filemd5("${path.root}/../../static_site/sandbox-redes.html")
}

resource "aws_s3_object" "sandbox_redes_js" {
  bucket       = aws_s3_bucket.this.id
  key          = "sandbox-redes.js"
  source       = "${path.root}/../../static_site/sandbox-redes.js"
  content_type = "application/javascript"
  etag         = filemd5("${path.root}/../../static_site/sandbox-redes.js")
}

# Dashboard do aluno (progresso + simulados)
resource "aws_s3_object" "dashboard_page" {
  bucket       = aws_s3_bucket.this.id
  key          = "dashboard.html"
  source       = "${path.root}/../../static_site/dashboard.html"
  content_type = "text/html"
  etag         = filemd5("${path.root}/../../static_site/dashboard.html")
}

resource "aws_s3_object" "dashboard_js" {
  bucket        = aws_s3_bucket.this.id
  key           = "dashboard.js"
  source        = "${path.root}/../../static_site/dashboard.js"
  content_type  = "application/javascript"
  cache_control = "no-cache, no-store, must-revalidate"
  etag          = filemd5("${path.root}/../../static_site/dashboard.js")
}

resource "aws_s3_object" "progress_js" {
  bucket        = aws_s3_bucket.this.id
  key           = "progress.js"
  source        = "${path.root}/../../static_site/progress.js"
  content_type  = "application/javascript"
  cache_control = "no-cache, no-store, must-revalidate"
  etag          = filemd5("${path.root}/../../static_site/progress.js")
}

resource "aws_s3_object" "trail_gate_css" {
  bucket       = aws_s3_bucket.this.id
  key          = "trail-gate.css"
  source       = "${path.root}/../../static_site/trail-gate.css"
  content_type = "text/css"
  etag         = filemd5("${path.root}/../../static_site/trail-gate.css")
}

resource "aws_s3_object" "admin_dashboard" {
  bucket       = aws_s3_bucket.this.id
  key          = "admin/dashboard.html"
  source       = "${path.root}/../../static_site/admin/dashboard.html"
  content_type = "text/html"
  etag         = filemd5("${path.root}/../../static_site/admin/dashboard.html")
}

resource "aws_s3_object" "admin_dashboard_css" {
  bucket       = aws_s3_bucket.this.id
  key          = "admin/dashboard.css"
  source       = "${path.root}/../../static_site/admin/dashboard.css"
  content_type = "text/css"
  etag         = filemd5("${path.root}/../../static_site/admin/dashboard.css")

  cache_control = "public, max-age=604800, immutable"
}

resource "aws_s3_object" "admin_dashboard_js" {
  bucket       = aws_s3_bucket.this.id
  key          = "admin/dashboard.js"
  source       = "${path.root}/../../static_site/admin/dashboard.js"
  content_type = "application/javascript"
  etag         = filemd5("${path.root}/../../static_site/admin/dashboard.js")

  cache_control = "no-cache, no-store, must-revalidate"
}

resource "aws_s3_object" "error_404" {
  bucket       = aws_s3_bucket.this.id
  key          = "404.html"
  source       = "${path.root}/../../static_site/404.html"
  content_type = "text/html"
  etag         = filemd5("${path.root}/../../static_site/404.html")
}
