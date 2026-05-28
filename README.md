# 🚀 Terraform Serverless — CloudTrilhas

Projeto educacional focado em Terraform, AWS, DevOps, CI/CD e Arquitetura Cloud.

O objetivo do projeto é construir uma aplicação serverless completa utilizando boas práticas reais de engenharia cloud, separação de ambientes, automação e governança.

---

# 🌎 CloudTrilhas

O CloudTrilhas é uma plataforma voltada para disponibilização de materiais e trilhas de estudo utilizando arquitetura serverless na AWS.

O projeto evoluiu de um laboratório inicial de Terraform para uma arquitetura próxima de ambientes corporativos reais.

---

# 🏗️ Arquitetura Atual

```text
Internet
   ↓
CloudFront
   ↓
S3 Static Site
   ↓
API Gateway
   ↓
Lambda
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

# 🌍 Ambientes

O projeto está organizado em três camadas principais:

```text
environments/
├── dev/      # Ambiente de desenvolvimento
├── prod/     # Ambiente de produção
└── shared/   # Recursos compartilhados da conta AWS
```

---

## 🧪 DEV

Ambiente utilizado para:

```text
Testes
Validações
Evolução da aplicação
Experimentos controlados
```

Domínio:

```text
https://dev.cloudtrilhas.com.br
```

Fluxo:

```text
terraform apply DEV
↓
validação
↓
promoção para PROD
```

---

## 🌐 PROD

Ambiente oficial de produção.

Domínio:

```text
https://cloudtrilhas.com.br
```

Objetivo:

```text
Disponibilidade
Estabilidade
Segurança
```

---

## 🏛️ SHARED

Responsável por recursos compartilhados da conta AWS.

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

Objetivo futuro:

```text
DEV Pipeline
↓
Approval
↓
PROD Pipeline
```

---

# 🧠 Conceitos Aplicados

## Terraform State

```text
State remoto S3
Separação por ambiente
Import Strategy
terraform state rm
terraform import
```

---

## Shared Resources

```text
OIDC
Budget
Governança centralizada
```

---

## Arquitetura Evolutiva

O projeto foi evoluindo por fases:

```text
Laboratório Terraform
↓
Serverless
↓
CI/CD
↓
DEV/PROD
↓
Shared Resources
↓
Arquitetura próxima do mercado
```

---

# 📘 Documentação

Toda evolução do projeto é documentada por fases.

Exemplo:

```text
docs/
├── Fase_22_CI_CD/
├── Fase_23_DEV_PROD/
└── Fase_24_Shared_Resources/
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

# 📈 Roadmap

## Próximas evoluções

```text
CI/CD Multiambiente
CloudTrail Shared
Observabilidade avançada
IAM modularizado
Least Privilege
Catálogo dinâmico de materiais
WAF
Governança avançada
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

Projeto licenciado sob MIT License.

---

# 👨‍💻 Autor

Ricardo Simines Scopim

AWS Solutions Architect Associate
AWS Cloud Practitioner
Instrutor AWS re/Start
