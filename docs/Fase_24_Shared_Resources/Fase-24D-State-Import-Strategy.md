# Fase 24D — State Import Strategy

## 🎯 Objetivo

Documentar a estratégia de migração de recursos entre Terraform States utilizada ao longo da Fase 24, servindo como referência para futuras refatorações de infraestrutura.

---

## 🧠 O problema geral

Quando a arquitetura evolui (separação de ambientes, centralização de recursos), é necessário mover recursos entre states sem destruí-los na AWS.

```
Cenário: Recurso existe na AWS + está no state DEV
Objetivo: Mover para state SHARED
Restrição: Zero downtime, zero recriação
```

---

## ⚙️ Estratégia em 4 passos

### Passo 1: Criar código no destino

Escrever o recurso no novo ambiente (shared):
```hcl
resource "aws_iam_openid_connect_provider" "github" {
  url = "https://token.actions.githubusercontent.com"
  ...
}
```

### Passo 2: terraform import no destino

Importar o recurso existente para o novo state:
```bash
cd environments/shared
terraform import <address> <aws_id>
```

O Terraform agora "conhece" o recurso no novo state.

### Passo 3: terraform state rm na origem

Remover o recurso do state antigo:
```bash
cd environments/dev
terraform state rm <address>
```

O Terraform "esquece" o recurso no state antigo — mas **não o destrói na AWS**.

### Passo 4: Validar ambos

```bash
cd environments/shared && terraform plan  # No changes ✅
cd environments/dev && terraform plan     # No changes ✅
```

Se ambos mostram "No changes", a migração foi bem-sucedida.

---

## 📊 Recursos migrados nesta fase

| Recurso | Origem | Destino | Método |
|---------|--------|---------|--------|
| OIDC Provider | dev | shared | import + state rm |
| IAM Role (GitHub) | dev | shared | import + state rm |
| IAM Policies | dev | shared | import + state rm |
| Budget | dev | shared | import + state rm |

---

## ⚠️ Cuidados importantes

### Nunca fazer import sem state rm na origem
Se o recurso existir em dois states, ambos tentarão gerenciá-lo — causando conflitos.

### Sempre validar com plan antes e depois
O `terraform plan` deve mostrar "No changes" em ambos os ambientes após a migração.

### state rm não destrói recursos
É seguro executar `state rm` — ele apenas remove a referência do state file, sem tocar na AWS.

### Ordem importa
1. Primeiro: import no destino
2. Depois: state rm na origem

Se fizer na ordem inversa, o `terraform plan` na origem pode tentar recriar o recurso.

---

## 📚 Documentação oficial

- https://developer.hashicorp.com/terraform/cli/commands/import
- https://developer.hashicorp.com/terraform/cli/commands/state/rm
- https://developer.hashicorp.com/terraform/cli/commands/state/mv
- https://developer.hashicorp.com/terraform/language/state

---

## 📈 Aprendizados

| Conceito | Aplicação |
|----------|-----------|
| Terraform State | Representa a "verdade" sobre a infraestrutura |
| Import | Assume controle de recurso existente |
| State rm | Libera recurso sem destruí-lo |
| Resource Ownership | Cada recurso deve ter um único "dono" (state) |
| Zero Downtime Migration | Possível com import + state rm |

---

## 🏁 Estado final do projeto

```
environments/shared/  → OIDC, Budget (recursos da conta)
environments/dev/     → Infraestrutura DEV (isolada)
environments/prod/    → Infraestrutura PROD (isolada)
```

Cada recurso tem um único state responsável. Governança clara e madura.
