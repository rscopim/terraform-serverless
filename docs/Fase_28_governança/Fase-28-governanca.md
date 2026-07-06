# Fase 28 — Governança de Recursos AWS

## 🎯 Objetivo

Implementar um mecanismo de Governança para inventariar automaticamente todos os recursos AWS pertencentes ao projeto CloudTrilhas, verificando se seguem o padrão de tags estabelecido.

A solução utiliza a AWS Resource Groups Tagging API para localizar todos os recursos que possuem a tag `Project = Terraform-Serverless`, permitindo acompanhar a conformidade da infraestrutura diretamente pelo Dashboard Administrativo.

---

## 🏗️ O que foi criado

- AWS Lambda para auditoria dos recursos
- Endpoint HTTP `GET /governance`
- Integração com API Gateway
- Integração com Dashboard Administrativo
- Inventário automático dos recursos do projeto
- Verificação das tags obrigatórias
- Resumo de conformidade da infraestrutura
- Listagem completa dos recursos encontrados
- Módulo Terraform (`modules/governance/`)

---

## 🧠 Conceitos importantes

### Cloud Governance

Cloud Governance é o conjunto de práticas utilizadas para garantir que os recursos da nuvem sejam criados e administrados seguindo padrões definidos pela organização.

Essas práticas facilitam:

- controle de custos
- segurança
- auditoria
- automação
- conformidade

---

### AWS Resource Groups Tagging API

Serviço da AWS responsável por localizar recursos através de Tags.

Ao invés de consultar cada serviço individualmente (Lambda, S3, DynamoDB, SNS, etc.), uma única API retorna todos os recursos que possuem determinada Tag.

---

### Tags Obrigatórias

Durante esta fase foi definido um padrão de Governança para todo o projeto.

Todo novo recurso deverá possuir obrigatoriamente:

```
Project
Environment
ManagedBy
```

Essas tags passam a fazer parte da arquitetura oficial do CloudTrilhas.

---

### Inventário Automatizado

A Lambda consulta automaticamente todos os recursos utilizando:

```
Project = Terraform-Serverless
```

Para cada recurso são verificadas:

- Serviço AWS
- Nome
- ARN
- Tags
- Tags ausentes
- Conformidade

---

## ⚙️ Como funciona

```
Dashboard Administrativo
        ↓
GET /governance
        ↓
Amazon API Gateway
        ↓
AWS Lambda
        ↓
AWS Resource Groups Tagging API
        ↓
Retorno em JSON
        ↓
Dashboard atualizado
```

---

## 📁 Arquivos principais

| Arquivo | Função |
|---------|--------|
| `modules/governance/main.tf` | Infraestrutura da Lambda |
| `modules/governance/variables.tf` | Variáveis do módulo |
| `modules/governance/outputs.tf` | Outputs da Lambda |
| `lambda_src/governance/app.py` | Auditoria dos recursos AWS |
| `modules/api_gateway/main.tf` | Endpoint `/governance` |
| `modules/api_gateway/variables.tf` | Variáveis do API Gateway |
| `modules/api_gateway/outputs.tf` | Endpoint da API |
| `static_site/admin/dashboard.html` | Dashboard Administrativo |

---

## 📚 Documentação oficial

### Terraform

- https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/lambda_function
- https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/apigatewayv2_api

### AWS

- https://docs.aws.amazon.com/resourcegroupstagging/latest/APIReference/Welcome.html
- https://docs.aws.amazon.com/resourcegroupstagging/latest/APIReference/API_GetResources.html

---

## 🧪 Como testar

Consultar a API:

```bash
curl.exe -X GET \
https://<api-id>.execute-api.us-west-2.amazonaws.com/governance
```

Resultado esperado:

```json
{
  "summary": {
    "total": 18,
    "compliant": 18,
    "non_compliant": 0
  },
  "resources": [
    {
      "service": "lambda",
      "name": "Terraform-Serverless-prod-costs",
      "compliant": true
    }
  ]
}
```

Validar Dashboard:

- Abrir Dashboard Administrativo
- Confirmar resumo da Governança
- Confirmar listagem dos recursos
- Confirmar status de conformidade
- Confirmar inventário do projeto

---

## 📈 Resultado esperado

- Inventário automático dos recursos AWS
- Recursos identificados através da Tag `Project`
- Auditoria automática das Tags obrigatórias
- Dashboard exibindo conformidade da infraestrutura
- Base preparada para futuras auditorias de Governança
- Padronização oficial das Tags do projeto