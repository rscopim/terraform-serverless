# Fase 16 — ACM

## 🎯 Objetivo

Criar e validar um certificado SSL/TLS utilizando AWS Certificate Manager para permitir HTTPS no domínio CloudTrilhas.

## 🏗️ O que foi criado

* Certificado SSL/TLS
* Domínio principal `cloudtrilhas.com.br`
* Subdomínio `www.cloudtrilhas.com.br`
* Validação DNS automática
* Integração com Route 53

## 🧠 Conceitos importantes

* ACM: serviço da AWS utilizado para gerenciamento de certificados SSL/TLS
* SSL/TLS: tecnologia responsável pela criptografia HTTPS
* DNS Validation: método de validação do certificado utilizando registros DNS
* us-east-1: região obrigatória para certificados utilizados no CloudFront
* HTTPS: protocolo seguro utilizado para tráfego criptografado na web

## ⚙️ Como funciona

O Terraform cria um certificado no AWS Certificate Manager para o domínio `cloudtrilhas.com.br` e para o subdomínio `www.cloudtrilhas.com.br`.

Como o certificado será usado futuramente no CloudFront, ele precisa ser criado na região `us-east-1`.

O ACM gera registros DNS de validação, e o Terraform cria esses registros automaticamente na Hosted Zone do Route 53.

Quando a validação DNS é concluída, o certificado muda para o status `Issued`.

## 📚 Documentação oficial

* https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/acm_certificate
* https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/acm_certificate_validation
* https://docs.aws.amazon.com/acm/latest/userguide/acm-overview.html

## 🧪 Como testar

1. Executar `terraform apply`
2. Acessar o console AWS na região `us-east-1`
3. Entrar em ACM
4. Localizar o certificado do domínio `cloudtrilhas.com.br`
5. Validar se o status está como `Issued`