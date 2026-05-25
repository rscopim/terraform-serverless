# Fase 23 — Separação de Ambientes DEV / PROD

## Objetivo

Evoluir o CloudTrilhas para um padrão mais próximo de ambientes corporativos, separando completamente os ambientes de desenvolvimento e produção.

Antes desta fase:
```text
DEV + PROD compartilhavam a mesma infraestrutura
```

Após esta fase:
```text
DEV → Ambiente isolado para testes
PROD → Ambiente estável para produção
```

---

# Cenário inicial

Estrutura anterior:
```text
terraform-serverless/
environments/
└── dev/
modules/
docs/
```

Problema:
```text
Alterações de desenvolvimento
podiam impactar produção.
```

Exemplos de risco:
- Mesmo bucket S3
- Mesmo domínio
- Mesmo state Terraform
- Mesmo ambiente operacional

---

# Conceito adotado

Separação de ambientes:
```text
DEV
↓
Testes
Validação
Mudanças rápidas
↓
PROD
Produção
Estabilidade
Proteção operacional
```
---

# Nova estrutura

Nova organização:
```text
terraform-serverless/
environments/
├── dev/
│
├── prod/
modules/
docs/
.github/
```

Cada ambiente possui:

```text
backend.tf
providers.tf
variables.tf
terraform.tfvars
main.tf
outputs.tf
```

---

# Separação do Terraform State

Antes:
```text
1 único state
```

Depois:
DEV:
```hcl
terraform {
  backend "s3" {
    bucket = "terraform-serverless-projeto-trilhas"
    key = "environments/dev/terraform.tfstate"
    region = "us-west-2"
    encrypt = true
  }
}
```

PROD:
```hcl
terraform {
  backend "s3" {
    bucket = "terraform-serverless-projeto-trilhas"
    key = "environments/prod/terraform.tfstate"
    region = "us-west-2"
    encrypt = true
  }
}
```

Resultado:
```text
State DEV separado do PROD
```

---

# Evolução das variáveis

Antes:
```hcl
default = "dev"
```

Problema:
```text
Estrutura e valores misturados.
```

Depois:
variables.tf:

```hcl
variable "environment" {
  description = "Ambiente"
  type = string
}
```

terraform.tfvars:
DEV:
```hcl
environment = "dev"
domain_name = "dev.cloudtrilhas.com.br"
```

PROD:
```hcl
environment = "prod"
domain_name = "cloudtrilhas.com.br"
```

Resultado:
```text
Estrutura separada dos valores.
```

---

# Bucket S3 isolado

Antes:
```text
materiais-e-trilhas-de-estudos
```

Problema:
```text
DEV poderia impactar PROD
```

Novo modelo:
DEV:
```text
materiais-e-trilhas-dev
```

PROD:
```text
materiais-e-trilhas-de-estudos
```

Resultado:
```text
Buckets isolados
```

---

# URLs isoladas

DEV:
```text
https://dev.cloudtrilhas.com.br
```

PROD:
```text
https://cloudtrilhas.com.br
```

PDF DEV:
```text
https://dev.cloudtrilhas.com.br/materiais/
```

PDF PROD:
```text
https://cloudtrilhas.com.br/materiais/
```

Resultado:
```text
Ambientes independentes
```
---

# ACM e DNS

DEV utiliza:
```text
dev.cloudtrilhas.com.br
```

Fluxo:
```text
Terraform Apply
↓
ACM cria certificado
↓
Route53 cria DNS
↓
DNS propaga
↓
ACM valida
↓
ISSUED
```

Importante:

```text
CloudFront utiliza ACM em us-east-1
```

---

# Estado final

PROD:
```text
CloudTrilhas produção
State separado
Bucket produção
Domínio produção
Protegido
```

DEV:
```text
CloudTrilhas laboratório
Infraestrutura isolada
Bucket separado
Domínio separado
```

---

# Benefícios obtidos

- Separação real de ambientes
- State isolado
- Buckets isolados
- DNS separado
- Menor risco operacional
- Melhor aderência mercado
- Pipeline preparada para evolução futura
- Estrutura próxima ambientes corporativos

---

# Lições aprendidas

## State Terraform é ambiente

State não representa apenas infraestrutura.
Representa:
```text
Infraestrutura
+
Referência operacional
```

---

## DEV e PROD nunca devem compartilhar recursos críticos

Itens críticos:
- S3
- Route53
- CloudFront
- State
- ACM

---

## Migração precisa ser controlada

Nunca executar:
```text
terraform apply
```

sem validar:
```text
terraform plan
```

---

# Próximos passos

Fase futura:
```text
Pipeline DEV → PROD separada
```

CloudTrilhas
Projeto educacional focado em AWS, DevOps, Terraform e Arquitetura Cloud.