![Terraform](https://img.shields.io/badge/Terraform-1.5+-623CE4?style=for-the-badge&logo=terraform)
![AWS](https://img.shields.io/badge/AWS-Cloud-FF9900?style=for-the-badge&logo=amazonaws)
![Serverless](https://img.shields.io/badge/Architecture-Serverless-blue?style=for-the-badge)
![CloudFront](https://img.shields.io/badge/CloudFront-CDN-blue?style=for-the-badge)
![Terraform](https://img.shields.io/badge/IaC-Terraform-purple?style=for-the-badge)
![Status](https://img.shields.io/badge/Status-Em%20Evolução-green?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)

# 🚀 CloudTrilhas — Plataforma Serverless AWS construída com Terraform

Projeto de Infraestrutura como Código (IaC) desenvolvido utilizando Terraform para provisionar uma arquitetura serverless moderna, escalável, segura e alinhada ao AWS Well-Architected Framework.

O projeto evoluiu de um laboratório técnico para uma plataforma educacional cloud voltada ao compartilhamento de materiais de estudos sobre:

- AWS
- Terraform
- Cloud Computing
- Arquitetura Cloud
- Serverless
- Certificações AWS

🌐 Portal:

```text
https://cloudtrilhas.com.br
```

---

## ✨ Objetivos do projeto

- Aplicar Terraform em cenários reais
- Construir arquitetura serverless moderna
- Utilizar boas práticas AWS
- Implementar segurança em camadas
- Criar observabilidade operacional
- Simular ambiente próximo ao mundo real
- Evoluir continuamente utilizando AWS Well-Architected

---

> 🚧 Projeto em constante evolução.


---

# 🧠 Visão geral

O CloudTrilhas utiliza uma arquitetura moderna baseada em serviços gerenciados AWS.

A plataforma foi construída priorizando:

- Escalabilidade
- Segurança
- Baixo custo operacional
- Infraestrutura modular
- Observabilidade
- Automação

---

# 🏗️ Arquitetura


```text
Usuário
   ↓
Route53
   ↓
CloudFront
(Geo Restriction)
   ↓
Origin Access Control (OAC)
   ↓
Bucket S3 Privado

Portal Web
   ↓
API Gateway
   ↓
Lambda
   ↓
DynamoDB

Observabilidade

CloudWatch
CloudTrail
SNS
EventBridge
Dashboard
```

---

# ⚙️ Serviços AWS utilizados

## Infraestrutura

- Terraform
- Route53
- CloudFront
- ACM
- Amazon S3
- IAM

## Aplicação

- API Gateway
- Lambda
- DynamoDB

## Observabilidade

- CloudWatch
- CloudTrail
- SNS

## Eventos

- EventBridge

## Segurança

- Origin Access Control (OAC)
- Geo Restriction
- HTTPS obrigatório
- TLS 1.2+
- Bucket privado

---

# 🔐 Segurança aplicada

- Bucket S3 privado
- Origin Access Control (OAC)
- HTTPS obrigatório
- TLS 1.2+
- Geo Restriction
- CloudFront
- IAM mínimo privilégio
- Block Public Access
- Arquitetura serverless

---

# 📁 Estrutura do projeto

```text
terraform-serverless/

├── docs/
│
├── arquitetura/
│
├── Fase_1_setup/
├── Fase_2_lambda/
├── Fase_3_logs/
├── Fase_4_sqs/
├── Fase_5_lambda_sqs/
├── Fase_6_sns/
├── Fase_7_eventbridge/
├── Fase_8_s3_static_site/
├── Fase_9_download_monitoring/
├── Fase_10_metrics/
├── Fase_11_dashboard/
├── Fase_12_api_gateway/
├── Fase_13_register_lead_lambda/
├── Fase_14_dynamodb/
├── Fase_15_route53/
├── Fase_16_acm/
├── Fase_17_cloudfront/
├── Fase_18_oac_geo_restriction/
├── Fase_19_well_architected_review/

├── environments/
│   └── dev/

├── modules/

├── static_site/

├── README.md

└── .gitignore
```

---

---

## 🔄 Pipeline CI/CD

Fluxo atual implementado:

```text
Feature Branch
↓
Pull Request
↓
Terraform Plan
↓
Merge Main
↓
Approval Production
↓
Terraform Apply


# 🧪 Funcionalidades implementadas

- Portal educacional Cloud
- Distribuição global via CloudFront
- Captura de leads
- API Serverless
- Registro DynamoDB
- Dashboard operacional
- HTTPS com ACM
- DNS Route53
- Restrição geográfica
- Observabilidade completa
- Infraestrutura modular Terraform

---

# 📈 Evolução arquitetural

✅ Fase 1 — Setup
✅ Fase 2 — Lambda
✅ Fase 3 — Logs
✅ Fase 4 — SQS
✅ Fase 5 — Lambda + SQS
✅ Fase 6 — SNS
✅ Fase 7 — EventBridge
✅ Fase 8 — S3 Static Website
✅ Fase 9 — Downloads
✅ Fase 10 — Métricas
✅ Fase 11 — Dashboard
✅ Fase 12 — API Gateway
✅ Fase 13 — Register Lead Lambda
✅ Fase 14 — DynamoDB
✅ Fase 15 — Route53
✅ Fase 16 — ACM
✅ Fase 17 — CloudFront
✅ Fase 18 — OAC + Geo Restriction
✅ Fase 19 — Well Architected Review

---

# 💰 Controle de custos

Ambiente otimizado para baixo custo utilizando:

- Lambda sob demanda
- DynamoDB PAY_PER_REQUEST
- CloudFront
- S3
- API Gateway serverless

Destruição ambiente:

```bash
terraform destroy
```

---

# 🚀 Próximas melhorias

- Dashboard operacional avançado
- Alarmes CloudWatch + SNS
- CI/CD GitHub Actions
- AWS WAF
- Analytics Educacional
- Catálogo dinâmico de materiais

---

# 👨‍💻 Autor

Ricardo Simines Scopim

AWS Certified Solutions Architect – Associate

AWS Cloud Practitioner

Instrutor Cloud Computing (AWS)

---

# 📌 Objetivo educacional

Este projeto foi criado com foco em aprendizado prático, arquitetura cloud moderna e simulação de cenários próximos ao mercado real.

Cada fase representa uma evolução arquitetural, permitindo aprendizado progressivo em AWS e Terraform.

CloudTrilhas continua em evolução 🚀

