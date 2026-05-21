# Fase 20 — Budget AWS + Controle Financeiro

## 🎯 Objetivo

Criar monitoramento financeiro da aplicação CloudTrilhas utilizando AWS Budgets, permitindo acompanhamento de custos da infraestrutura e geração de alertas automáticos quando limites definidos forem atingidos.
O objetivo desta fase é fortalecer governança financeira e aplicar práticas de FinOps dentro do ambiente AWS.

---

## 🏗️ O que foi criado

* AWS Budget mensal
* Filtro por tag de projeto
* Cost Allocation Tag
* Alertas automáticos por percentual de consumo
* Integração com notificações por e-mail
* Monitoramento isolado do CloudTrilhas

---

## 🧠 Conceitos importantes

### AWS Budgets

Serviço da AWS utilizado para monitorar gastos, utilização e custos previstos da conta.
Permite criação de alertas automáticos quando limites definidos são atingidos.

---

### FinOps

Prática utilizada para gestão financeira em ambientes cloud.
Objetivo:
* Controle de custos
* Otimização financeira
* Governança cloud
* Visibilidade operacional

---

### Cost Allocation Tags

Tags utilizadas para separar custos entre projetos, aplicações ou ambientes.
Tag utilizada:
```text
Project=Terraform-Serverless```
Dessa forma somente recursos relacionados ao CloudTrilhas são contabilizados.
---

### Budget Threshold

Percentual configurado para disparo de alertas financeiros.
Configuração aplicada:
```text
20%
50%
80%
100%
```

---

### Cost Budget

Tipo de orçamento utilizado para acompanhar gastos financeiros.
Periodicidade:
```text
MONTHLY
```

---

## ⚙️ Como funciona

Fluxo operacional:
```text
Recursos AWS
(Lambda / S3 / CloudFront / DynamoDB / API Gateway)
↓
Tags aplicadas
Project=Terraform-Serverless
↓
Cost Allocation Tags
↓
AWS Budget
↓
Verificação consumo financeiro
↓
Threshold atingido
↓
Notificação E-mail
```

---

## 📚 Documentação oficial

* https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/budgets_budget
* https://docs.aws.amazon.com/cost-management/latest/userguide/budgets-managing-costs.html
* https://docs.aws.amazon.com/awsaccountbilling/latest/aboutv2/cost-alloc-tags.html
* https://aws.amazon.com/aws-cost-management/aws-budgets/

---

## 🧪 Como validar

### Validar Cost Allocation Tag

Abrir:
```text
Billing and Cost Management
→ Cost Allocation Tags
→ User Defined
```

Validar:
```text
Project
```

Status esperado:
```text
Active
```

---

### Validar Budget

Abrir:
```text
Billing
→ Budgets
```

Selecionar:
```text
Terraform-Serverless-dev-monthly-budget
```

Verificar:
* Valor mensal
* Thresholds
* Filtro aplicado

---

### Validar filtro

Verificar:
```text
Project=Terraform-Serverless
```

Resultado esperado:

Somente recursos do CloudTrilhas sendo contabilizados.

---

### Validar notificações

Threshold configurado:
```text
20%
50%
80%
100%
```

Ao atingir limite:

```text
Notificação automática por e-mail
```

---

## 📈 Resultado esperado

Ao final desta fase o CloudTrilhas deve possuir:
* Monitoramento financeiro
* Governança de custos
* Visibilidade operacional
* Alertas financeiros automáticos
* Separação de custos por projeto
* Aplicação de práticas FinOps

---

## 💰 Recursos monitorados

Custos relacionados ao:
* CloudFront
* Lambda
* DynamoDB
* API Gateway
* S3
* SNS
* EventBridge
* CloudTrail
* CloudWatch
* Route53

Filtrados por:

```text
Project=Terraform-Serverless
```

---

## 🚀 Evolução futura

Próximas melhorias:
* Dashboard financeiro CloudWatch
* AWS Cost Explorer avançado
* Relatórios financeiros mensais
* Otimização contínua de custos
* Monitoramento preditivo de gastos

---

## 📌 Observação operacional

A ativação da Cost Allocation Tag foi realizada via Billing Console.

Motivo:
Billing e gerenciamento financeiro pertencem à camada administrativa da conta AWS, não sendo parte direta da infraestrutura provisionada via Terraform.
