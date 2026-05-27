# Fase 24A — Shared Resources

## O que são Shared Resources?

Shared Resources são recursos compartilhados entre múltiplos ambientes.

Exemplo:
```text
DEV
PROD
↓
utilizam recurso compartilhado
```

---

# Exemplos clássicos

```text
OIDC Provider
CloudTrail
Budget
KMS
IAM centralizado
```

---

# Estrutura criada

```text
environments/
├── shared/
├── dev/
└── prod/
```

---

# Novo backend Terraform

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

# Conceito importante

## Resource

```hcl
resource "aws_xxx"
```

Terraform cria.

---

## Data

```hcl
data "aws_xxx"
```

Terraform consulta recurso existente.

---

# Benefícios da arquitetura

```text
✅ Menos conflito
✅ Mais organização
✅ Melhor governança
✅ Mais próximo do mercado
✅ Separação correta de responsabilidades
```