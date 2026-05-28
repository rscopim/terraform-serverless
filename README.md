# 🚀 Terraform Serverless — CloudTrilhas

<p align="center">

Terraform • AWS • Serverless • CI/CD • DevOps • Cloud Architecture

</p>

---

# ☁️ Sobre o Projeto

O **CloudTrilhas** é um projeto focado em arquitetura serverless utilizando AWS e Terraform.

O objetivo é construir uma aplicação real aplicando:

* Infraestrutura como Código (IaC)
* Arquitetura Serverless
* CI/CD
* Multiambiente
* Governança Cloud
* Shared Resources
* Boas práticas DevOps

---

# 🏗️ Arquitetura

```text
Internet
   ↓
CloudFront
   ↓
S3 Static Website
   ↓
API Gateway
   ↓
Lambda Functions
   ↓
DynamoDB
```

Serviços auxiliares:

```text
SNS
SQS
EventBridge
CloudWatch
CloudTrail
AWS Budget
GitHub Actions
OIDC
```

---

# 🌎 Ambientes

O projeto está separado em três ambientes principais:

```text
environments/
├── dev/
├── prod/
└── shared/
```

---

## 🧪 DEV

Ambiente utilizado para:

```text
Testes
Validações
Experimentos
Novas funcionalidades
```

URL:

```text
https://dev.cloudtrilhas.com.br
```

---

## 🌐 PROD

Ambiente oficial de produção.

URL:

```text
https://cloudtrilhas.com.br
```

---

## 🏛️ SHARED

Ambiente responsável pelos recursos compartilhados da conta AWS.

Atualmente:

```text
GitHub Actions OIDC
AWS Budget
```

Conceito:

```text
Recursos globais
↓
não pertencem DEV/PROD
↓
pertencem conta AWS
```

---

# ⚙️ Tecnologias Utilizadas

## ☁️ AWS

```text
Lambda
API Gateway
DynamoDB
S3
CloudFront
SNS
SQS
EventBridge
CloudWatch
CloudTrail
IAM
Route53
ACM
AWS Budgets
```

---

## 🧰 DevOps

```text
Terraform
GitHub Actions
OIDC
Remote State
CI/CD
```

---

# 🔄 CI/CD

Pipeline automatizada utilizando GitHub Actions.

Fluxo atual:

```text
Feature Branch
↓
Terraform Plan
↓
Pull Request
↓
Review
↓
Merge
↓
Terraform Apply
```

---

# 🔐 Segurança

O projeto utiliza:

```text
OIDC GitHub Actions
IAM Roles
Least Privilege
Remote State S3
Separação DEV/PROD
```

---

# 📂 Estrutura do Projeto

```text
terraform-serverless/
│
├── .github/
│   └── workflows/
│
├── docs/
│
├── environments/
│   ├── dev/
│   ├── prod/
│   └── shared/
│
├── lambda_src/
│
├── modules/
│
├── static_site/
│
└── README.md
```

---

# 📘 Documentação

Toda evolução do projeto é documentada por fases.

```text
docs/
├── Fase_22_CI_CD/
├── Fase_23_DEV_PROD/
└── Fase_24_Shared_Resources/
```

---

# 🧠 Conceitos Aplicados

```text
Terraform State
Remote State
Import Strategy
terraform import
terraform state rm
Shared Resources
Cloud Governance
CI/CD
Serverless
OIDC
```

---

# 🚀 Roadmap

Próximas evoluções planejadas:

```text
CI/CD Multiambiente
CloudTrail Shared
Observabilidade avançada
IAM modularizado
Least Privilege
WAF
Governança avançada
```

---

# 🎯 Objetivos do Projeto

```text
Aprendizado Terraform
Arquitetura AWS
Boas práticas DevOps
CI/CD
Serverless
Governança Cloud
Portfolio profissional
```

---

# 🏆 Principais Aprendizados

```text
Terraform avançado
Separação ambientes
State Strategy
Cloud Governance
CI/CD real
OIDC
CloudFront
Route53
Serverless AWS
Refatoração sem downtime
```

---

# 📄 Licença

MIT License.

---

# 👨‍💻 Autor

Ricardo Simines Scopim

AWS Solutions Architect Associate
AWS Cloud Practitioner
Instrutor AWS re/Start

