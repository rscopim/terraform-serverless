# Fase 22B — Apply Manual + Remote State + Hardening

## 🎯 Objetivo

Evoluir a pipeline para um modelo corporativo com aprovação manual antes do deploy, migrar o Terraform State para backend remoto (S3) e aplicar hardening inicial nas permissões IAM.

---

## 🏗️ O que foi implementado

- Environment `production` com required reviewers
- Terraform Apply condicionado a aprovação manual
- Backend remoto S3 para Terraform State
- Versionamento e encryption no bucket de state
- Remoção de AdministratorAccess
- Policy customizada com least privilege

---

## 🧠 Conceitos importantes

### GitHub Environment Protection

Recurso que exige aprovação manual antes de executar jobs em um environment específico:
```
Terraform Plan → ⏸️ Aguardando aprovação → ✅ Approve → Terraform Apply
```

### Remote State (S3 Backend)

```hcl
terraform {
  backend "s3" {
    bucket  = "terraform-serverless-projeto-trilhas"
    key     = "environments/dev/terraform.tfstate"
    region  = "us-west-2"
    encrypt = true
  }
}
```

**Por que é necessário:**
- Máquina local e GitHub Actions precisam do mesmo state
- Sem remote state, o CI tentaria recriar toda a infraestrutura
- Versionamento permite rollback do state
- Encryption protege dados sensíveis

### Hardening IAM

Substituição de `AdministratorAccess` por policy customizada com apenas os serviços necessários:
- Lambda, API Gateway, DynamoDB, S3
- CloudFront, Route 53, ACM, SNS, SQS
- CloudTrail, EventBridge, CloudWatch
- IAM (controlado)

---

## ⚙️ Fluxo com aprovação

```
git push → GitHub Actions
        ↓
Job: terraform-plan
  └── Plan gerado e salvo como artifact
        ↓
Job: terraform-apply
  ├── Condição: github.ref == 'refs/heads/main'
  ├── Environment: production (requer aprovação)
  ├── ⏸️ Aguardando reviewer
  ├── ✅ Aprovado
  ├── Download plan artifact
  └── terraform apply -auto-approve tfplan
        ↓
Infraestrutura atualizada
```

---

## 🧪 Erros encontrados e correções

### Erro 1: Plan tentou recriar tudo
- **Causa**: State local não acessível pelo runner
- **Correção**: Migração para backend S3

### Erro 2: OIDC falhou com environment
- **Causa**: Token OIDC inclui claim `environment:production` que não estava na trust policy
- **Correção**: Adicionar claim na trust policy

### Erro 3: Versão Terraform diferente
- **Causa**: Plan gerado com versão X, apply com versão Y
- **Correção**: Fixar `terraform_version: 1.10.5` nos dois jobs

### Erro 4: ZIP Lambda não encontrado
- **Causa**: Runners são efêmeros — arquivos do job 1 não existem no job 2
- **Correção**: upload-artifact + download-artifact

---

## 📁 Arquivos principais

| Arquivo | Função |
|---------|--------|
| `environments/dev/backend.tf` | Configuração S3 backend |
| `.github/workflows/terraform-ci.yml` | Jobs plan + apply |

---

## 📈 Resultado esperado

- Deploy nunca acontece sem aprovação explícita
- State compartilhado entre local e CI
- Permissões IAM mínimas (least privilege)
- Auditoria completa de quem aprovou cada deploy
- Pipeline segura e profissional
