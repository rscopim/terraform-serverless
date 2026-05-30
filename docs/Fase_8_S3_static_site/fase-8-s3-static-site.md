# Fase 8 — S3 Static Website (Portal de Estudos)

## 🎯 Objetivo

Criar o portal CloudTrilhas como um site estático hospedado no Amazon S3, com upload automatizado de páginas HTML, CSS, JavaScript e PDFs via Terraform. Esta fase marca a transição do projeto de infraestrutura pura para uma aplicação real com interface de usuário.

---

## 🏗️ O que foi criado

- Bucket S3 configurado para hospedagem estática
- Upload automatizado de `index.html`, `style.css`, `app.js`
- Upload de PDFs da pasta `materiais/`
- Upload de assets (logos, ícones, favicon)
- Upload de páginas de cursos (subpastas)
- Bucket Policy para acesso via CloudFront (OAC)
- Block Public Access habilitado (bucket privado)
- Módulo Terraform reutilizável (`modules/s3_static_site/`)

---

## 🧠 Conceitos importantes

### S3 Static Website Hosting

Funcionalidade do S3 que permite servir arquivos estáticos (HTML, CSS, JS) diretamente como um site. Configurações incluem documento index e documento de erro.

### Bucket Policy

Política JSON que define quem pode acessar os objetos do bucket. Neste projeto, apenas o CloudFront (via OAC) tem permissão de leitura — o bucket não é público.

### Block Public Access

Camada de segurança que impede exposição acidental do bucket. Todas as 4 opções estão habilitadas, garantindo que nenhuma ACL ou policy possa tornar o bucket público.

### Content-Type

Header HTTP que informa ao navegador o tipo de conteúdo sendo entregue. O Terraform define o content-type correto para cada arquivo (text/html, text/css, application/pdf, etc.).

### ETags e Cache

O atributo `etag = filemd5(...)` permite ao Terraform detectar quando um arquivo local foi alterado, fazendo upload apenas dos arquivos modificados em cada `apply`.

### fileset()

Função Terraform que lista arquivos em um diretório com base em um padrão glob. Utilizada com `for_each` para fazer upload dinâmico de todos os arquivos de uma pasta.

---

## ⚙️ Como funciona

```
Terraform lê arquivos locais (static_site/)
        ↓
Calcula hash MD5 de cada arquivo
        ↓
Compara com estado atual no S3
        ↓
Faz upload apenas dos arquivos alterados
        ↓
Define Content-Type correto para cada arquivo
        ↓
Site disponível via CloudFront (HTTPS)
```

Estrutura do site no S3:
```
bucket/
├── index.html
├── style.css
├── app.js
├── linux-training.css
├── aws.html, docker.html, linux.html, ...
├── assets/logo/, assets/icons/, assets/favicon/
├── materiais/*.pdf
├── docker/*.html
├── kubernetes/*.html
├── terraform/*.html
├── linux/*.html
├── python/*.html
├── redes/*.html
├── github/*.html
├── cloudformation/*.html
├── ai-practitioner/*.html
├── developer/*.html
├── solutions-architect/*.html
├── solutions-architect-pro/*.html
├── cloud-practitioner/*.html
├── robots.txt
└── sitemap.xml
```

---

## 📁 Arquivos principais

| Arquivo | Função |
|---------|--------|
| `modules/s3_static_site/main.tf` | Bucket + Policy + Uploads |
| `modules/s3_static_site/variables.tf` | Caminhos dos arquivos |
| `modules/s3_static_site/outputs.tf` | URL, ARN, nome do bucket |
| `static_site/` | Todos os arquivos do portal |

---

## 📚 Documentação oficial

- https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/s3_bucket
- https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/s3_bucket_website_configuration
- https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/s3_object
- https://docs.aws.amazon.com/AmazonS3/latest/userguide/WebsiteHosting.html

---

## 🧪 Como testar

```bash
# Aplicar infraestrutura
terraform apply

# Verificar objetos no bucket
aws s3 ls s3://materiais-e-trilhas-dev/ --recursive

# Acessar o site (via CloudFront)
# https://www.dev.cloudtrilhas.com.br
```

---

## 📈 Resultado esperado

- Bucket criado com todos os arquivos do portal
- Site acessível via CloudFront com HTTPS
- PDFs disponíveis para download em `/materiais/`
- Uploads incrementais (apenas arquivos alterados)
- 96 páginas HTML + 13 PDFs + assets servidos corretamente
