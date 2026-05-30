# Fase 20 — AWS Budgets (Governança Financeira)

## 🎯 Objetivo

Implementar controle financeiro da infraestrutura CloudTrilhas utilizando AWS Budgets, com alertas automáticos por email quando limites de gastos são atingidos, aplicando práticas de FinOps.

---

## 🏗️ O que foi criado

- Budget mensal com limite de $10.00
- Filtro por Cost Allocation Tag (`Project=Terraform-Serverless`)
- Alertas automáticos em 4 thresholds (20%, 50%, 80%, 100%)
- Notificação por email para o administrador
- Módulo Terraform (`modules/budget/`)

---

## 🧠 Conceitos importantes

### AWS Budgets

Serviço de governança financeira que permite definir orçamentos e receber alertas quando gastos se aproximam ou excedem limites definidos. Suporta budgets de custo, uso e reservas.

### FinOps

Prática de gestão financeira em cloud que combina engenharia, finanças e negócios para otimizar custos. Princípios:
- Visibilidade de gastos
- Otimização contínua
- Accountability por equipe/projeto
- Decisões baseadas em dados

### Cost Allocation Tags

Tags aplicadas aos recursos AWS que permitem segmentar custos por projeto, ambiente ou equipe no Cost Explorer e Budgets.

Tag utilizada:
```
Project = Terraform-Serverless
```

Isso garante que apenas recursos do CloudTrilhas sejam contabilizados no budget.

### Thresholds de Alerta

Percentuais configurados para disparo de notificações:

| Threshold | Ação |
|-----------|------|
| 20% ($2.00) | Alerta informativo |
| 50% ($5.00) | Atenção |
| 80% ($8.00) | Alerta crítico |
| 100% ($10.00) | Limite atingido |

### Budget Type: COST

Tipo de orçamento que monitora gastos financeiros reais (não uso ou reservas). Periodicidade mensal com reset automático.

---

## ⚙️ Como funciona

```
Recursos AWS executam (Lambda, S3, CloudFront, etc.)
        ↓
AWS registra custos por serviço
        ↓
Cost Allocation Tags filtram por projeto
        ↓
Budget compara gasto atual vs limite ($10)
        ↓
Threshold atingido (20%, 50%, 80%, 100%)
        ↓
Notificação automática por email
```

---

## 📁 Arquivos principais

| Arquivo | Função |
|---------|--------|
| `modules/budget/main.tf` | Budget + Thresholds + Notifications |
| `modules/budget/variables.tf` | Limite, email, projeto |

---

## 📚 Documentação oficial

- https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/budgets_budget
- https://docs.aws.amazon.com/cost-management/latest/userguide/budgets-managing-costs.html
- https://docs.aws.amazon.com/awsaccountbilling/latest/aboutv2/cost-alloc-tags.html

---

## 🧪 Como testar

```bash
# Verificar budget criado
aws budgets describe-budgets --account-id <ACCOUNT_ID>

# Verificar Cost Allocation Tag ativa
# Console: Billing → Cost Allocation Tags → User Defined
# Tag "Project" deve estar com status "Active"
```

---

## ⚠️ Passo manual necessário

A ativação da Cost Allocation Tag deve ser feita via Billing Console:

1. Billing and Cost Management → Cost Allocation Tags
2. User-defined cost allocation tags
3. Selecionar tag `Project`
4. Ativar

Esse passo é administrativo e não pode ser automatizado via Terraform.

---

## 💰 Custos monitorados

| Serviço | Custo estimado/mês |
|---------|-------------------|
| Route 53 | ~$0.50 |
| S3 + CloudFront | ~$0.05 |
| Lambda + API GW | ~$0.00 (Free Tier) |
| DynamoDB | ~$0.00 (Free Tier) |
| CloudTrail | ~$0.00 |
| **Total** | **< $1.00** |

Budget de $10 oferece margem confortável para crescimento.

---

## 📈 Resultado esperado

- Governança financeira implementada
- Alertas automáticos antes de gastos inesperados
- Custos isolados por projeto via tags
- Visibilidade operacional sobre gastos
- Prática FinOps aplicada desde o início do projeto
