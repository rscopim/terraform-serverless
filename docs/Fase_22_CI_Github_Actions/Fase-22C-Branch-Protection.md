# Fase 22C — Branch Protection + Pull Request Workflow

## 🎯 Objetivo

Implementar proteção da branch `main` e fluxo obrigatório de Pull Request, garantindo que toda alteração passe por validação automática e revisão antes de ser aplicada na infraestrutura.

---

## 🏗️ O que foi implementado

- Branch Ruleset protegendo a `main`
- Push direto bloqueado
- Pull Request obrigatório antes do merge
- Terraform Plan como status check obrigatório
- Require branch up-to-date antes do merge
- Block force push e restrict delete
- Ajuste OIDC para suportar Pull Requests

---

## 🧠 Conceitos importantes

### Branch Protection

Regras que impedem alterações diretas na branch principal:
- Nenhum push direto permitido
- Alterações apenas via Pull Request
- Status checks devem passar antes do merge
- Force push bloqueado

### Pull Request Workflow

Fluxo corporativo padrão:
```
Feature Branch → Push → PR criado → CI executa → Review → Merge → CD executa
```

### Required Status Checks

O job `Terraform Plan` é configurado como check obrigatório. Se o plan falhar, o merge é bloqueado automaticamente.

### Require Branch Up-to-Date

Garante que a feature branch está sincronizada com a main antes do merge, evitando conflitos e plans desatualizados.

---

## ⚙️ Fluxo final

```
Developer cria feature branch
        ↓
git push origin feature/nova-funcionalidade
        ↓
Pull Request criado automaticamente
        ↓
GitHub Actions executa:
  ├── terraform fmt -check
  ├── terraform init
  ├── terraform validate
  └── terraform plan
        ↓
Status Check: ✅ Terraform Plan passed
        ↓
Review do plan + código
        ↓
Merge para main
        ↓
GitHub Actions executa:
  └── terraform apply (com aprovação)
        ↓
Infraestrutura atualizada
```

---

## 🧪 Erros encontrados e correções

### Erro: OIDC falhou em Pull Request
- **Causa**: Trust policy não incluía claim `pull_request`
- **Correção**: Adicionar `repo:rscopim/terraform-serverless:pull_request`

### Erro: Branch desatualizada
- **Causa**: Feature branch criada antes de commits recentes na main
- **Correção**: `git pull origin main` ou botão "Update Branch" no GitHub

### Erro: Terraform Format
- **Causa**: Arquivo não formatado bloqueou o pipeline
- **Correção**: `terraform fmt -recursive` antes do push

### Erro: Non Fast Forward
- **Causa**: Branch remota tinha commits mais recentes
- **Correção**: `git pull --rebase` antes do push

---

## 📁 Configuração aplicada

**GitHub → Settings → Rules → Branch Ruleset:**

| Regra | Status |
|-------|--------|
| Require Pull Request | ✅ |
| Require Status Checks (Terraform Plan) | ✅ |
| Require Branch Up To Date | ✅ |
| Block Force Push | ✅ |
| Restrict Delete | ✅ |

---

## 📈 Resultado esperado

- Main protegida contra alterações diretas
- Toda mudança passa por PR + validação automática
- Plan visível antes do merge (review de infraestrutura)
- Menor risco operacional
- Fluxo próximo de ambientes corporativos reais
- Auditoria completa de quem alterou o quê
