# Fase 24A — Shared Resources (Estrutura)

## 🎯 Objetivo

Criar a estrutura do ambiente `shared/` com backend S3 independente para gerenciar recursos que pertencem à conta AWS como um todo.

---

## 🏗️ O que foi criado

- Diretório `environments/shared/`
- Backend S3 com key separada
- Estrutura de variáveis e providers
- Separação conceitual entre `resource` e `data`

---

## 🧠 Conceitos importantes

### Shared Resources

Recursos compartilhados entre múltiplos ambientes que existem uma única vez na conta:

| Recurso | Por quê é shared |
|---------|-----------------|
| OIDC Provider | 1 por conta AWS (global) |
| Budget | Monitora conta inteira |
| CloudTrail (org) | Auditoria centralizada |
| KMS Keys | Compartilhadas entre serviços |

### resource vs data

```hcl
# resource: Terraform CRIA e gerencia
resource "aws_iam_openid_connect_provider" "github" { ... }

# data: Terraform apenas CONSULTA (não gerencia)
data "aws_iam_openid_connect_provider" "github" { ... }
```

No shared, usamos `resource`. Nos ambientes DEV/PROD, usamos `data` para referenciar recursos shared.

### Backend separado

```hcl
terraform {
  backend "s3" {
    bucket  = "terraform-serverless-projeto-trilhas"
    key     = "environments/shared/terraform.tfstate"
    region  = "us-west-2"
    encrypt = true
  }
}
```

---

## ⚙️ Operação

```bash
# Gerenciar recursos shared
cd environments/shared
terraform init
terraform plan
terraform apply

# Recursos shared são referenciados por DEV/PROD via data sources ou outputs
```

---

## 📈 Resultado esperado

- Estrutura shared criada e funcional
- State independente dos ambientes
- Base para centralizar OIDC e Budget
- Separação clara de responsabilidades
