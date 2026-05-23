# Fase 22B — Apply Manual + Remote State + Hardening Inicial

## Objetivo

Evoluir a pipeline CI/CD do CloudTrilhas para um modelo mais próximo de ambientes corporativos reais.
Nesta fase foram implementados:
- Aprovação manual antes do Terraform Apply
- Backend remoto do Terraform State
- Integração GitHub Actions + AWS via OIDC
- Uso de credenciais temporárias IAM
- Hardening inicial removendo AdministratorAccess
- Controle de permissões customizadas

---

# Cenário anterior

Fluxo existente:
```text
VSCode
↓
git push
↓
GitHub Actions
↓
Terraform Format
↓
Terraform Validate
↓
Terraform Plan
```

Problema:
```text
Qualquer alteração poderia seguir automaticamente
para Apply sem camada adicional de proteção.
```

Outro problema:
```text
Terraform State local
```

Impacto:
```text
GitHub Actions não enxergava os recursos existentes.

Resultado:
Tentativa de recriação completa da infraestrutura.
```

---

# Solução implementada

Nova arquitetura:
```text
VSCode
↓
git push
↓
Terraform Format
↓
Terraform Init
↓
Terraform Validate
↓
Terraform Plan
↓
Approval Manual
↓
Terraform Apply
↓
AWS
```

---

# Etapa 1 — Environment Protection GitHub

Criado Environment:
```text
production
```

Configurado:
```text
Required reviewers
```

Usuário autorizado:
```text
rscopim
```

Resultado:
```text
Terraform Apply somente após aprovação.
```

---

# Etapa 2 — Remote State Terraform

Problema encontrado:
Erro:
```text
GitHub Actions tentou recriar
CloudFront
S3
Lambda
DynamoDB
API Gateway
Route53
```

Causa:
```text
State local
```

Correção:
Criado backend remoto:

Arquivo:
```text
environments/dev/backend.tf
```

Configuração:
```hcl
terraform {
 backend "s3" {
  bucket =
  "terraform-serverless-tfstate-830286960930-us-west-2"
  key =
  "environments/dev/terraform.tfstate"
  region =
  "us-west-2"
  encrypt = true
 }
}
```

Bucket criado:

```text
terraform-serverless-tfstate-830286960930-us-west-2
```

Proteções aplicadas:
- Versionamento
- Criptografia
- Block Public Access

Resultado:
```text
Terraform local
↓
Mesmo state

GitHub Actions
↓
Mesmo state
```

---

# Etapa 3 — OIDC + IAM Role

Modelo antigo NÃO utilizado:
```text
AWS_ACCESS_KEY_ID
AWS_SECRET_ACCESS_KEY
```

Modelo implementado:
```text
GitHub Actions
↓
OIDC Provider
↓
IAM Role temporária
↓
AWS STS
↓
Credenciais temporárias
↓
Terraform
```

Role criada:
```text
Terraform-Serverless-dev-github-actions-role
```

Benefícios:
- Sem Access Key
- Sem Secret Key
- Menor risco operacional
- Modelo corporativo moderno

---

# Etapa 4 — Aprovação Manual

Fluxo final:
```text
git push
↓
Terraform Plan
↓
Waiting Approval
↓
Review Deployments
↓
Approve and Deploy
↓
Terraform Apply
```

Benefícios:
- Controle operacional
- Segurança
- Auditoria
- Maior previsibilidade

---

# Etapa 5 — Erros encontrados

## Erro 1
Erro:
```text
Could not assume role with OIDC
```

Causa:
Environment production alterou token OIDC.

Correção:
Trust Policy ajustada:

```text
repo:rscopim/terraform-serverless:environment:production
```

---

## Erro 2

Erro:
```text
Terraform Plan tentando recriar tudo
```

Causa:
```text
State local
```

Correção:
```text
Backend remoto S3
```

---

## Erro 3

Erro:
```text
Plan criado em versão Terraform
diferente do Apply
```

Correção:
Padronização:
```text
Terraform 1.10.5
```

---

## Erro 4

Erro:
```text
ZIP Lambda não encontrado
```

Causa:
GitHub Actions não possuía artefatos locais.

Correção:
Pipeline gerando ZIP automaticamente:

```text
hello_lambda.zip
register_lead.zip
download_metrics.zip
```

---

## Erro 5

Erro:
```text
Pasta Lambda incorreta
```

Causa:
Pipeline buscava:

```text
register_lead_lambda
```

Estrutura real:
```text
register_lead
```

Correção:
Ajuste workflow.

---

# Hardening Inicial

Removido:
```text
AdministratorAccess
```

Substituído por:
```text
Policy customizada CloudTrilhas
```

Serviços autorizados:
- Lambda
- API Gateway
- DynamoDB
- S3
- CloudFront
- Route53
- ACM
- SNS
- SQS
- CloudTrail
- EventBridge
- CloudWatch
- IAM controlado

Objetivo:
```text
Least Privilege
```

---

# Resultado Final

Infraestrutura evoluiu para:
- CI/CD seguro
- Approval Workflow
- Backend remoto
- OIDC
- IAM temporário
- Auditoria operacional
- Hardening inicial

---

# Próximos passos

Fase 22C:

```text
Branch Protection

Pull Request Workflow

Melhoria contínua IAM

Pipeline corporativa
```

---

CloudTrilhas

Projeto educacional construído para estudo prático de Cloud Computing, DevOps e Arquitetura AWS.