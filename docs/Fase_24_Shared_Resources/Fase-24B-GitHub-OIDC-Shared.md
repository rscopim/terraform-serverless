# Fase 24B — GitHub OIDC Shared

## Problema encontrado

Durante a criação do ambiente DEV surgiu o erro:

```text
EntityAlreadyExists:
token.actions.githubusercontent.com already exists
```

---

# Causa

OIDC Provider é global na conta AWS.

Não pode existir:
```text
1 OIDC DEV
1 OIDC PROD
```

Existe apenas:
```text
1 OIDC por conta AWS
```

---

# Solução

OIDC foi movido para:
```text
environments/shared
```

---

# Import Terraform

OIDC já existia na AWS.
Foi necessário importar:
```powershell
terraform import module.github_actions_oidc.aws_iam_openid_connect_provider.github arn:aws:iam::ACCOUNT_ID:oidc-provider/token.actions.githubusercontent.com
```

---

# Recursos importados

```text
OIDC Provider
IAM Role
IAM Policies
Policy Attachments
```

---

# Estratégia utilizada

```text
terraform import
↓
assume recurso existente
↓
sem recriar
↓
sem downtime
```

---

# Resultado

```text
✅ OIDC centralizado
✅ GitHub Actions funcional
✅ DEV e PROD compartilhando OIDC
✅ Sem conflitos
```