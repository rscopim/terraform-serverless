# Fase 24B — GitHub OIDC Shared

## 🎯 Objetivo

Migrar o OIDC Provider e IAM Role do GitHub Actions para o ambiente `shared/`, resolvendo o erro `EntityAlreadyExists` que ocorria ao tentar criar o provider em múltiplos ambientes.

---

## 🏗️ O que foi migrado

- `aws_iam_openid_connect_provider` (OIDC Provider)
- `aws_iam_role` (GitHub Actions Role)
- `aws_iam_role_policy_attachment` (Policies)
- Trust Policy com claims para main, PR e environment

---

## 🧠 O problema

```
environments/dev/  → terraform apply → Cria OIDC Provider ✅
environments/prod/ → terraform apply → EntityAlreadyExists ❌
```

O OIDC Provider `token.actions.githubusercontent.com` é **global na conta AWS** — só pode existir um, independente de quantos ambientes existam.

---

## ⚙️ Processo de migração

```bash
# 1. Importar no shared state
cd environments/shared
terraform import \
  module.github_actions_oidc.aws_iam_openid_connect_provider.github \
  arn:aws:iam::<ACCOUNT_ID>:oidc-provider/token.actions.githubusercontent.com

# 2. Importar IAM Role
terraform import \
  module.github_actions_oidc.aws_iam_role.github_actions \
  Terraform-Serverless-dev-github-actions-role

# 3. Remover do state DEV (sem destruir na AWS)
cd environments/dev
terraform state rm module.github_actions_oidc

# 4. Validar
terraform plan  # Deve mostrar "No changes"
```

---

## 🔐 Trust Policy final

A role permite acesso de:
- Push na main: `repo:rscopim/terraform-serverless:ref:refs/heads/main`
- Pull Requests: `repo:rscopim/terraform-serverless:pull_request`
- Environment production: `repo:rscopim/terraform-serverless:environment:production`

---

## 📈 Resultado esperado

- OIDC centralizado no shared
- DEV e PROD compartilham o mesmo provider
- Zero conflitos entre ambientes
- GitHub Actions funcional para todos os ambientes
- Recurso gerenciado em um único lugar
