# Fase 24C — Budget Shared

## 🎯 Objetivo

Migrar o AWS Budget para o ambiente `shared/`, resolvendo o erro `DuplicateRecordException` e centralizando a governança financeira em um único ponto de controle.

---

## 🏗️ O que foi migrado

- `aws_budgets_budget` com filtro por Cost Allocation Tag
- Thresholds de alerta (20%, 50%, 80%, 100%)
- Notificações por email

---

## 🧠 O problema

```
environments/dev/  → terraform apply → Cria Budget ✅
environments/prod/ → terraform apply → DuplicateRecordException ❌
```

O Budget monitora custos da **conta inteira** (filtrado por tag). Não faz sentido ter um budget por ambiente — ele deve existir uma única vez.

---

## ⚙️ Processo de migração

```bash
# 1. Importar no shared state
cd environments/shared
terraform import \
  module.budget.aws_budgets_budget.this \
  <ACCOUNT_ID>:Terraform-Serverless-dev-monthly-budget

# 2. Remover do state DEV
cd environments/dev
terraform state rm module.budget

# 3. Validar ambos
cd environments/shared && terraform plan  # No changes
cd environments/dev && terraform plan     # No changes
```

---

## 🧠 Conceito: state rm ≠ destroy

```
terraform state rm → Remove do Terraform State (arquivo .tfstate)
                   → NÃO remove da AWS
                   → Recurso continua existindo
                   → Terraform "esquece" que gerenciava aquele recurso
```

Isso permite "mover" recursos entre states sem downtime.

---

## 📈 Resultado esperado

- Budget centralizado no shared
- Governança financeira em um único lugar
- Zero conflitos entre DEV e PROD
- Alertas funcionando normalmente
- State consistente em todos os ambientes
