# Fase 23 — Separação de Ambientes DEV / PROD

## 🎯 Objetivo

Separar completamente os ambientes de desenvolvimento e produção do CloudTrilhas, garantindo isolamento total de infraestrutura, state, domínios e dados — padrão obrigatório em ambientes corporativos.

---

## 🏗️ O que foi criado

- Diretório `environments/prod/` com configuração independente
- Terraform State separado (keys diferentes no mesmo bucket S3)
- Buckets S3 isolados por ambiente
- Domínios DNS separados (dev vs prod)
- Certificados ACM independentes
- Distribuições CloudFront separadas
- Variáveis parametrizadas via `terraform.tfvars`

---

## 🧠 Conceitos importantes

### Isolamento de Ambientes

Princípio fundamental: alterações em DEV nunca devem impactar PROD. Isso requer separação de:
- State Terraform
- Recursos AWS (buckets, tabelas, APIs)
- Domínios e certificados
- Pipelines de deploy

### Terraform State por Ambiente

Cada ambiente possui seu próprio state file no S3:

```hcl
# DEV
key = "environments/dev/terraform.tfstate"

# PROD
key = "environments/prod/terraform.tfstate"
```

Isso garante que `terraform destroy` em DEV não afeta PROD.

### Parametrização via tfvars

A mesma estrutura de módulos é reutilizada, com valores diferentes por ambiente:

**DEV (`terraform.tfvars`):**
```hcl
environment = "dev"
domain_name = "dev.cloudtrilhas.com.br"
bucket_name = "materiais-e-trilhas-dev"
```

**PROD (`terraform.tfvars`):**
```hcl
environment = "prod"
domain_name = "cloudtrilhas.com.br"
bucket_name = "materiais-e-trilhas-de-estudos"
```

### Módulos Reutilizáveis

Os 17 módulos Terraform são compartilhados entre ambientes. A diferença está apenas nos valores das variáveis — o código é idêntico.

---

## ⚙️ Arquitetura multi-ambiente

```
terraform-serverless/
├── environments/
│   ├── dev/           ← Testes e validações
│   │   ├── main.tf
│   │   ├── variables.tf
│   │   ├── terraform.tfvars
│   │   └── backend.tf (key: dev/terraform.tfstate)
│   │
│   ├── prod/          ← Produção estável
│   │   ├── main.tf
│   │   ├── variables.tf
│   │   ├── terraform.tfvars
│   │   └── backend.tf (key: prod/terraform.tfstate)
│   │
│   └── shared/        ← Recursos globais (Fase 24)
│
└── modules/           ← Código compartilhado
```

---

## 🌐 Separação de domínios

| Ambiente | URL | Bucket |
|----------|-----|--------|
| DEV | https://www.dev.cloudtrilhas.com.br | materiais-e-trilhas-dev |
| PROD | https://www.cloudtrilhas.com.br | materiais-e-trilhas-de-estudos |

---

## 🔐 Separação de segurança

| Recurso | DEV | PROD |
|---------|-----|------|
| State | `dev/terraform.tfstate` | `prod/terraform.tfstate` |
| CloudFront | Distribution separada | Distribution separada |
| ACM | Certificado dev.* | Certificado raiz |
| DynamoDB | Tabela *-dev-leads | Tabela *-prod-leads |
| API Gateway | API separada | API separada |

---

## 📚 Documentação oficial

- https://developer.hashicorp.com/terraform/language/settings/backends/s3
- https://developer.hashicorp.com/terraform/language/values/variables
- https://developer.hashicorp.com/terraform/tutorials/modules/module-use

---

## 🧪 Como operar

```bash
# Trabalhar no DEV
cd environments/dev
terraform init
terraform plan
terraform apply

# Trabalhar no PROD (separado)
cd environments/prod
terraform init
terraform plan
terraform apply
```

---

## ⚠️ Lições aprendidas

### State é identidade do ambiente
Cada state representa um ambiente completo. Nunca compartilhar state entre DEV e PROD.

### DEV e PROD nunca compartilham recursos críticos
Buckets, tabelas, APIs e distribuições devem ser independentes.

### Migração requer cuidado
Ao separar ambientes, usar `terraform plan` antes de qualquer `apply` para validar que nenhum recurso será destruído acidentalmente.

---

## 📈 Resultado esperado

- Ambientes completamente isolados
- Alterações em DEV não impactam PROD
- Mesmo código, valores diferentes
- Deploy independente por ambiente
- Estrutura pronta para escalar (staging, QA, etc.)
