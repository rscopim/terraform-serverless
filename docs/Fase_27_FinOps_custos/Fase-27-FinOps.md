# Fase 27 — FinOps Dashboard (Custos AWS)

## 🎯 Objetivo

Implementar um painel FinOps para o CloudTrilhas, permitindo visualizar os custos reais do projeto diretamente no Dashboard Administrativo.

A solução utiliza a API do AWS Cost Explorer para consultar os custos do mês corrente, filtrando exclusivamente os recursos pertencentes ao projeto através da tag `Project = Terraform-Serverless`.

---

## 🏗️ O que foi criado

- AWS Lambda para consulta ao AWS Cost Explorer
- Endpoint HTTP `GET /costs`
- Integração com API Gateway
- Integração com Dashboard Administrativo
- Filtro por Tag (`Project = Terraform-Serverless`)
- Exibição do custo total do mês
- Exibição do custo por serviço AWS
- Exibição do custo diário
- Exclusão automática de serviços com custo igual a US$ 0,00
- Módulo Terraform (`modules/costs/`)

---

## 🧠 Conceitos importantes

### FinOps

FinOps (Financial Operations) é uma prática que une equipes de tecnologia, finanças e negócios para acompanhar e otimizar os custos em nuvem.

O objetivo é permitir decisões baseadas em dados reais de consumo.

---

### AWS Cost Explorer

Serviço da AWS responsável por disponibilizar informações detalhadas sobre custos e utilização dos serviços em nuvem.

Nesta fase foi utilizada sua API para consultas em tempo real.

---

### Cost Allocation Tags

As Cost Allocation Tags permitem separar os custos da conta AWS por projetos, ambientes ou centros de custo.

Neste projeto foi utilizada a tag:

```
Project = Terraform-Serverless
```

Dessa forma, o Dashboard apresenta apenas os custos relacionados ao CloudTrilhas.

---

### Granularidade

Foram implementadas duas formas de visualização:

- Custo mensal agrupado por serviço
- Custos diários do mês corrente

---

## ⚙️ Como funciona

```
Dashboard Administrativo
        ↓
GET /costs
        ↓
Amazon API Gateway
        ↓
AWS Lambda
        ↓
AWS Cost Explorer
        ↓
Filtro pela Tag Project
        ↓
Retorno em JSON
        ↓
Dashboard atualizado
```

---

## 📁 Arquivos principais

| Arquivo | Função |
|---------|--------|
| `modules/costs/main.tf` | Infraestrutura da Lambda |
| `modules/costs/variables.tf` | Variáveis do módulo |
| `modules/costs/outputs.tf` | Outputs da Lambda |
| `lambda_src/costs/app.py` | Consulta ao Cost Explorer |
| `modules/api_gateway/main.tf` | Endpoint `/costs` |
| `modules/api_gateway/variables.tf` | Variáveis do API Gateway |
| `modules/api_gateway/outputs.tf` | Endpoint da API |
| `static_site/admin/dashboard.html` | Integração com o Dashboard |

---

## 📚 Documentação oficial

### Terraform

- https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/lambda_function
- https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/apigatewayv2_api

### AWS

- https://docs.aws.amazon.com/cost-management/latest/userguide/ce-api.html
- https://docs.aws.amazon.com/aws-cost-management/latest/APIReference/API_GetCostAndUsage.html
- https://docs.aws.amazon.com/awsaccountbilling/latest/aboutv2/cost-alloc-tags.html

---

## 🧪 Como testar

Consultar custos:

```bash
curl.exe -X GET \
https://<api-id>.execute-api.us-west-2.amazonaws.com/costs
```

Resultado esperado:

```json
{
  "total": 0.00,
  "period": "AAAA-MM-DD a AAAA-MM-DD",
  "services": {
    "Amazon Route 53": 0.00,
    "AWS Cost Explorer": 0.00
  },
  "daily": {
    "2026-07-01": 0.00
  }
}
```

Validar Dashboard:

- Abrir Dashboard Administrativo
- Confirmar exibição do custo total
- Confirmar gráfico diário
- Confirmar tabela por serviço
- Confirmar filtro por Tag Project

---

## 📈 Resultado esperado

- Custos reais do projeto exibidos em tempo real
- Dados provenientes do AWS Cost Explorer
- Custos filtrados pela tag `Project = Terraform-Serverless`
- Dashboard integrado ao ambiente AWS
- Arquitetura totalmente serverless
- Base preparada para evolução das funcionalidades FinOps