# Fase 22 — CI/CD com GitHub Actions (Introdução)

## 🎯 Objetivo

Implementar uma pipeline CI/CD completa utilizando GitHub Actions para automatizar validação e deploy da infraestrutura Terraform na AWS. Esta fase marca a evolução do projeto de execução manual para um fluxo automatizado próximo de ambientes corporativos.

---

## 📖 Estrutura da Fase 22

Esta fase é dividida em 4 sub-fases por sua complexidade:

| Sub-fase | Tema | Foco |
|----------|------|------|
| **22A** | CI Seguro | Pipeline básica com OIDC |
| **22B** | Apply Manual + Remote State | Aprovação, backend S3, hardening |
| **22C** | Branch Protection | Pull Request workflow corporativo |
| **22D** | Archive File Lambda | Empacotamento via Terraform |

---

## 🧠 Conceitos fundamentais

### CI — Continuous Integration

Prática de validar automaticamente cada alteração enviada ao repositório. No contexto Terraform:
```
git push → terraform fmt → terraform validate → terraform plan
```

Objetivo: Detectar erros antes que cheguem à produção.

### CD — Continuous Delivery

Prática de entregar alterações de forma automatizada e controlada:
```
terraform plan → aprovação manual → terraform apply
```

Objetivo: Deploy seguro e auditável.

### GitHub Actions

Plataforma de automação integrada ao GitHub. Executa workflows definidos em YAML quando eventos ocorrem (push, pull request, merge).

### OIDC (OpenID Connect)

Protocolo de autenticação que permite ao GitHub Actions assumir uma IAM Role na AWS sem credenciais estáticas:

```
GitHub Actions → OIDC Provider → STS AssumeRole → Credenciais temporárias → Terraform
```

Benefícios:
- Zero access keys armazenadas
- Credenciais expiram automaticamente
- Auditável via CloudTrail
- Modelo recomendado pela AWS

### Remote State (S3 Backend)

Armazenamento do Terraform State em bucket S3 compartilhado:
- Máquina local e CI/CD usam o mesmo state
- Versionamento habilitado para rollback
- Encryption at rest
- Locking para evitar execuções simultâneas

---

## 🏗️ Arquitetura final do CI/CD

```
Developer (VSCode)
        ↓
git push (feature branch)
        ↓
Pull Request criado
        ↓
GitHub Actions dispara:
  ├── terraform fmt -check
  ├── terraform init
  ├── terraform validate
  └── terraform plan
        ↓
Code Review + Plan Review
        ↓
Merge para main
        ↓
GitHub Actions dispara:
  ├── Download artifacts (plan + ZIPs)
  └── terraform apply -auto-approve
        ↓
Infraestrutura atualizada na AWS
```

---

## 📁 Arquivos criados

| Arquivo | Função |
|---------|--------|
| `.github/workflows/terraform-ci.yml` | Workflow CI/CD |
| `modules/github_actions_oidc/` | OIDC Provider + IAM Role |
| `environments/dev/backend.tf` | Remote State S3 |

---

## 🔐 Segurança do pipeline

| Controle | Implementação |
|----------|---------------|
| Autenticação | OIDC (zero secrets de longa duração) |
| Autorização | Trust Policy restrita ao repositório |
| Aprovação | Environment protection rules |
| Auditoria | GitHub Actions logs + CloudTrail |
| Isolamento | Runners efêmeros (descartados após uso) |
| Proteção | Branch protection na main |

---

## 📚 Documentação oficial

- https://docs.github.com/en/actions
- https://github.com/aws-actions/configure-aws-credentials
- https://github.com/hashicorp/setup-terraform
- https://developer.hashicorp.com/terraform/language/settings/backends/s3

---

## � Erros encontrados e resolvidos

| # | Erro | Causa | Solução |
|---|------|-------|---------|
| 1 | Plan tentou recriar tudo | State local | Backend remoto S3 |
| 2 | OIDC não assumia role | Trust policy incompleta | Adicionar environment claim |
| 3 | Versão Terraform diferente | Plan vs Apply | Padronizar 1.10.5 |
| 4 | ZIP Lambda não encontrado | Runners efêmeros | upload/download-artifact |
| 5 | Pasta Lambda incorreta | Nome errado no workflow | Corrigir path |

---

## 📈 Resultado final

- Pipeline CI/CD funcional e segura
- Zero credenciais estáticas
- Validação automática em cada PR
- Deploy controlado com aprovação
- State compartilhado entre local e CI
- Base para separação DEV/PROD (Fase 23)
