![Terraform](https://img.shields.io/badge/Terraform-1.5+-623CE4?style=for-the-badge&logo=terraform)
![AWS](https://img.shields.io/badge/AWS-Cloud-FF9900?style=for-the-badge&logo=amazonaws)
![Serverless](https://img.shields.io/badge/Architecture-Serverless-blue?style=for-the-badge)
![Status](https://img.shields.io/badge/Status-Em%20Evolução-green?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)

# 🚀 Terraform-Serverless — Arquitetura Serverless na AWS com Terraform

Projeto de infraestrutura como código (IaC) utilizando Terraform para provisionar uma arquitetura serverless moderna, escalável e orientada a eventos na AWS.

Este projeto demonstra a construção de um sistema distribuído baseado em eventos, seguindo boas práticas utilizadas em ambientes reais de produção.

---

## ✨ Principais objetivos

- Demonstrar arquitetura serverless com AWS
- Aplicar Terraform de forma modular
- Implementar processamento assíncrono com SQS
- Evoluir para arquitetura orientada a eventos (Event-Driven)

---

> 🚧 Este projeto está em constante evolução.

---

# 🧠 Visão geral

A aplicação é baseada em uma arquitetura serverless, onde eventos são processados de forma assíncrona utilizando filas e funções Lambda.

As mensagens são enviadas para uma fila SQS, processadas automaticamente por funções Lambda e, posteriormente, podem gerar notificações ou novos eventos.

O objetivo é simular um fluxo real de processamento desacoplado, resiliente e escalável.

---

# 🏗️ Arquitetura

```text
                ┌──────────────────────┐
                │     Amazon SQS       │
                │  (Fila de mensagens) │
                └─────────┬────────────┘
                          │
                          ▼
                ┌──────────────────────┐
                │     AWS Lambda       │
                │ (Processamento async)│
                └─────────┬────────────┘
                          │
                          ▼
                ┌──────────────────────┐
                │  CloudWatch Logs     │
                │   (Observabilidade)  │
                └──────────────────────┘

---

# ⚙️ Serviços utilizados

* AWS Lambda (execução serverless)
* Amazon SQS (fila de mensagens)
* AWS IAM (roles e permissões)
* Amazon CloudWatch Logs (monitoramento)
* Terraform (Infraestrutura como código)

---

# 🔐 Segurança aplicada

* IAM Role com permissões mínimas para execução da Lambda
* Permissão restrita de acesso ao SQS
* Separação de responsabilidades entre serviços
* Execução sem uso de credenciais diretas

---

# 📁 Estrutura do projeto

```text
terraform-serverless/
├── docs/
│   ├── arquitetura/
│   ├── Fase_1_setup/
│   ├── Fase_2_lambda/
│   ├── Fase_3_logs/
│   ├── Fase_4_sqs/
│   └── Fase_5_lambda_sqs/
│
├── environments/
│   └── dev/
│       ├── main.tf
│       ├── variables.tf
│       └── outputs.tf
│
├── lambda_src/
│   └── hello_lambda/
│       └── app.py
│
├── modules/
│   ├── lambda/
│   └── sqs/
│
├── README.md
├── .gitignore
```

---

# 🚀 Como executar o projeto

## 🌱 Ambiente DEV

```bash
cd environments/dev

terraform init
terraform plan
terraform apply
```

---

# 🧪 Como testar

## Executar Lambda via CLI

```bash
aws lambda invoke \
  --function-name Terraform-Serverless-dev-hello-lambda \
  --region us-west-2 \
  --payload '{"teste":"readme"}' \
  --cli-binary-format raw-in-base64-out \
  response.json
```

---

## Enviar mensagem para SQS

```bash
aws sqs send-message \
  --queue-url <QUEUE_URL> \
  --message-body "Mensagem teste" \
  --region us-west-2
```

---

# 🧪 Funcionalidades implementadas

* Criação de função Lambda via Terraform
* Empacotamento automático do código Python
* Execução da Lambda via AWS CLI
* Logs centralizados no CloudWatch
* Criação de fila SQS
* Dead Letter Queue (DLQ)
* Integração automática entre SQS e Lambda

---

# 💰 Controle de custos

## 🌱 DEV

```bash
terraform destroy
```

---

# 🔒 Recursos mantidos

* Nenhum recurso persistente obrigatório
* Todos os recursos podem ser destruídos após uso

---

# 📈 Evolução do projeto

* Fase 1 — Setup do projeto
* Fase 2 — Lambda
* Fase 3 — CloudWatch Logs
* Fase 4 — SQS
* Fase 5 — Integração Lambda com SQS

---

# 🧩 Próximas melhorias

* Integração com SNS (notificações)
* Uso de EventBridge para eventos
* Criação de API Gateway
* Frontend estático com S3
* Arquitetura completa orientada a eventos

---

# 👨‍💻 Autor

Projeto desenvolvido por Ricardo Simines Scopim
Instrutor de Cloud Computing (AWS)

---

# 📌 Observação - Objetivo educacional

Este projeto foi desenvolvido com foco em aprendizado prático e simulação de cenários reais utilizados no mercado de Cloud Computing e DevOps.

Cada fase do projeto representa uma evolução arquitetural, permitindo compreensão progressiva dos serviços AWS e do Terraform.
