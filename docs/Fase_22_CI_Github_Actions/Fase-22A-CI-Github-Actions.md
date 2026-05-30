# Fase 22A — CI Seguro com GitHub Actions + OIDC

## 🎯 Objetivo

Criar a pipeline de Continuous Integration utilizando GitHub Actions com autenticação OIDC na AWS, executando validações automáticas do Terraform a cada push no repositório.

---

## 🏗️ O que foi criado

- GitHub Actions Workflow (`.github/workflows/terraform-ci.yml`)
- OIDC Provider na conta AWS
- IAM Role para GitHub Actions com trust policy
- Jobs: Format Check → Init → Validate → Plan
- Integração segura sem access keys

---

## 🧠 Conceitos importantes

### Workflow YAML

Arquivo que define a automação. Estrutura:
```yaml
on: [push, pull_request]  # Trigger
jobs:
  terraform-plan:          # Job
    runs-on: ubuntu-latest # Runner
    steps:                 # Passos sequenciais
      - uses: actions/checkout@v4
      - uses: aws-actions/configure-aws-credentials@v5
      - uses: hashicorp/setup-terraform@v4
      - run: terraform fmt -check
      - run: terraform init
      - run: terraform validate
      - run: terraform plan
```

### Runner

Máquina virtual temporária (Ubuntu) que executa os comandos do workflow. É criada no início do job e descartada ao final — nenhum dado persiste entre execuções.

### OIDC Flow

```
GitHub Actions inicia job
        ↓
GitHub gera JWT token com claims:
  - repository: rscopim/terraform-serverless
  - ref: refs/heads/main
  - environment: production
        ↓
configure-aws-credentials envia token para AWS STS
        ↓
STS valida token contra OIDC Provider
        ↓
STS emite credenciais temporárias (15min)
        ↓
Terraform usa credenciais para acessar AWS
```

### Trust Policy

Define quem pode assumir a IAM Role:
```json
{
  "Condition": {
    "StringLike": {
      "token.actions.githubusercontent.com:sub": [
        "repo:rscopim/terraform-serverless:ref:refs/heads/main",
        "repo:rscopim/terraform-serverless:environment:production",
        "repo:rscopim/terraform-serverless:pull_request"
      ]
    }
  }
}
```

---

## ⚙️ Pipeline executada

```
Push/PR no GitHub
        ↓
Job: terraform-plan
  ├── Checkout código
  ├── Configure AWS (OIDC)
  ├── Setup Terraform 1.10.5
  ├── terraform fmt -recursive -check
  ├── terraform init
  ├── terraform validate
  └── terraform plan -out=tfplan
        ↓
Resultado visível na PR/Actions
```

---

## 📁 Arquivos principais

| Arquivo | Função |
|---------|--------|
| `.github/workflows/terraform-ci.yml` | Workflow completo |
| `modules/github_actions_oidc/main.tf` | OIDC + IAM Role |

---

## 📚 Documentação oficial

- https://docs.github.com/en/actions/deployment/security-hardening-your-deployments/configuring-openid-connect-in-amazon-web-services
- https://github.com/aws-actions/configure-aws-credentials
- https://github.com/hashicorp/setup-terraform

---

## 🧪 Como validar

```bash
# Push para branch
git push origin feature/test

# Abrir GitHub → Actions
# Verificar execução do workflow
# Todos os steps devem estar ✅
```

---

## 📈 Resultado esperado

- Cada push dispara validação automática
- Erros de formatação detectados antes do merge
- Plan visível para review antes de aplicar
- Autenticação segura via OIDC
- Zero secrets de longa duração no GitHub
