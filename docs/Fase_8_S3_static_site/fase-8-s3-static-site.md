# Fase 8 — S3 Static Website (Portal de Estudos)

## 🎯 Objetivo

Criar um site estático no Amazon S3 para disponibilizar materiais em PDF para alunos.

## 🏗️ O que foi criado

* Bucket S3
* Hospedagem estática
* Página HTML
* Arquivo CSS
* Upload de arquivos PDF
* Política pública de leitura para os objetos do site

## 🧠 Conceitos importantes

* S3 Static Website: hospedagem de site estático utilizando S3
* Bucket Policy: política que permite acesso público aos arquivos do site
* Objeto S3: arquivo armazenado no bucket
* Content-Type: tipo de conteúdo entregue ao navegador

## ⚙️ Como funciona

O Terraform cria um bucket S3 configurado para hospedagem estática.

Os arquivos `index.html`, `style.css` e os PDFs da pasta `materiais` são enviados para o bucket como objetos S3.

A política do bucket permite leitura pública dos objetos, tornando o site acessível pela internet.

## 📚 Documentação oficial

* https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/s3_bucket
* https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/s3_bucket_website_configuration
* https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/s3_bucket_public_access_block
* https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/s3_bucket_policy
* https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/s3_object

## 🧪 Como testar

1. Executar `terraform apply`
2. Obter a URL com `terraform output static_site_url`
3. Acessar o site pelo navegador
4. Clicar nos botões de download dos PDFs
5. Validar os links para GitHub e LinkedIn