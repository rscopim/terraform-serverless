# Fase 22C — Branch Protection + Pull Request Workflow

## Objetivo

Evoluir a pipeline CI/CD do CloudTrilhas para um modelo corporativo de controle de mudanças.

Nesta fase foram implementados:

- Proteção da branch principal (main)
- Pull Request obrigatório
- Terraform Plan obrigatório antes do Merge
- Bloqueio de Push direto na Main
- Exigência de branch atualizada
- Terraform Apply apenas após Merge
- Aprovação manual para produção
- Ajustes OIDC para Pull Request

---

# Cenário anterior

Fluxo anterior:
VSCode
↓
git push main
↓
Terraform Plan
↓
Approval
↓
Terraform Apply

Problema:
Alterações poderiam seguir diretamente para produção.
Mesmo com Approval no Apply ainda existia:
- Push direto na Main
- Sem revisão intermediária
- Sem fluxo corporativo de Pull Request

---

# Objetivo técnico

Novo fluxo desejado:
Feature Branch
↓
Push Branch
↓
Pull Request
↓
Terraform Plan
↓
Validação
↓
Merge Main
↓
Approval Production
↓
Terraform Apply

---

# Etapa 1 — Proteção da Main

GitHub:
Settings
↓
Rules
↓
Branch Ruleset

Criada regra:
Protect Main Branch

Proteções aplicadas:
✅ Require Pull Request before merging
✅ Require Status Checks
✅ Require Branch Up To Date
✅ Block Force Push
✅ Restrict Delete

Resultado:
Push direto bloqueado.

Teste realizado:
git push origin main

Resultado:
remote:
Changes must be made through a pull request.
Proteção validada.

---

# Etapa 2 — Terraform Plan obrigatório

Configurado:
Terraform Plan
Como Status Check obrigatório.

Resultado:
Antes do Merge:
Terraform Plan precisa executar.

Fluxo:
Pull Request
↓
Terraform CI/CD
↓
Terraform Plan
↓
Success
↓
Merge permitido

---

# Etapa 3 — Terraform Apply bloqueado em Pull Request

Ajuste workflow:

terraform-apply:
if:
github.event_name == 'push'
github.ref == 'refs/heads/main'
Resultado:
Pull Request:
Terraform Apply

SKIPPED

Merge Main:
Terraform Apply
EXECUTA
Comportamento corporativo validado.

---

# Etapa 4 — OIDC Pull Request

Problema encontrado:
Erro:
Could not assume role with OIDC:
Not authorized to perform:
sts:AssumeRoleWithWebIdentity

Causa:
Trust Policy contemplava:

Main:
repo:rscopim/terraform-serverless:ref:refs/heads/main

Environment:
repo:rscopim/terraform-serverless:environment:production

Mas não contemplava:
Pull Request

Correção:
Adicionado:
repo:rscopim/terraform-serverless:pull_request

Resultado:
OIDC funcionando:
Main
Pull Request
Environment Production

---

# Etapa 5 — Branch desatualizada

Erro:
This branch is out-of-date with base branch.

Causa:
Feature Branch criada antes de alterações recentes.

Correção:
Update Branch

ou:
git pull origin main

Resultado:
Branch sincronizada.

---

# Etapa 6 — Terraform Format

Erro:
Terraform Format
terraform fmt -recursive -check
main.tf

Erro:
Terraform exited with code 3

Causa:
Arquivo não formatado.

Correção:
terraform fmt -recursive

Commit:
Aplica terraform fmt

Resultado:
Pipeline aprovada.

---

# Etapa 7 — Non Fast Forward

Erro:
Updates were rejected because tip is behind remote branch.
Causa:
Branch remota possuía commits mais recentes.
Correção:
git pull origin feature/teste-real-pipeline --rebase
Resultado:
Push realizado.

---

# Teste operacional realizado

Alteração simples:
README.md

Fluxo validado:
Feature Branch
↓
Push
↓
Terraform Plan
↓
Pull Request
↓
Merge Main
↓
Approval Production
↓
Terraform Apply

Resultado:
Pipeline operacional validada.

---

# Fluxo final CloudTrilhas

Feature Branch
↓
Pull Request
↓
Terraform Plan
↓
Branch atualizada
↓
Merge Main
↓
Approval Production
↓
Terraform Apply
↓
AWS

---

# Benefícios obtidos

✅ Main protegida
✅ Pull Request obrigatório
✅ Menor risco operacional
✅ Terraform Plan obrigatório
✅ Aprovação produção
✅ OIDC seguro
✅ Pipeline corporativa
✅ Processo DevOps próximo ao mercado real

---

# Próximos passos

Fase 22D
Empacotamento Lambda via archive_file

Fase 23
Separação DEV / PROD

Fase 24
IAM Modularizado

---

CloudTrilhas

Projeto educacional construído para estudo prático de Cloud Computing, DevOps e Arquitetura AWS.