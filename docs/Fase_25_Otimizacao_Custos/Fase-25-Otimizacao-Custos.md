# Fase 25 — Otimização de Custos e Destruição do Ambiente DEV

## 🎯 Objetivo

Reduzir os custos operacionais da infraestrutura CloudTrilhas de ~$15/mês para < $1/mês, removendo o ambiente DEV desnecessário, eliminando o CloudTrail com Data Events (principal fonte de custo) e corrigindo a nomenclatura dos recursos PROD.

---

## 🏗️ O que foi feito

### 1. Destruição completa do ambiente DEV

```
terraform destroy -auto-approve
→ 228 recursos removidos
```

Recursos destruídos:
- CloudFront Distribution DEV (`E4RRDHDIJAUZR`)
- S3 Bucket DEV (`materiais-e-trilhas-dev`)
- Route 53 Hosted Zone DEV (`dev.cloudtrilhas.com.br`)
- ACM Certificate DEV
- API Gateway DEV
- Lambda Functions DEV (3 funções)
- DynamoDB Table DEV
- SQS + DLQ DEV
- SNS Topic DEV
- EventBridge Rules DEV
- CloudWatch Dashboard + 8 Alarmes DEV
- CloudTrail DEV
- IAM Roles DEV

### 2. Remoção do CloudTrail no PROD

O CloudTrail com Data Events para S3 era o principal vilão de custo:
- Cada acesso a objeto no S3 gerava um evento no CloudTrail
- Eventos eram armazenados em um bucket S3 dedicado
- Bucket de logs crescia continuamente → custo de storage alto

```hcl
# REMOVIDO do environments/prod/main.tf:
# module "cloudtrail" { ... }
```

**Economia estimada: ~$5/mês**

### 3. Correção da nomenclatura PROD

Os recursos do PROD estavam com nomes `*-dev-*` (erro de configuração histórico). O apply recriou os recursos com nomes corretos:

| Recurso | Antes | Depois |
|---------|-------|--------|
| IAM Role | `Terraform-Serverless-dev-github-actions-role` | `Terraform-Serverless-prod-github-actions-role` |
| Dashboard | `Terraform-Serverless-dev-operational-dashboard` | `Terraform-Serverless-prod-operational-dashboard` |
| SNS Topic | `Terraform-Serverless-dev-topic` | `Terraform-Serverless-prod-topic` |
| SQS Queue | `Terraform-Serverless-dev-queue` | `Terraform-Serverless-prod-queue` |
| Lambda | `Terraform-Serverless-dev-*` | `Terraform-Serverless-prod-*` |

---

## 🧠 Conceitos importantes

### FinOps — Otimização de Custos em Cloud

Prática de governança financeira onde os custos são monitorados continuamente e recursos desnecessários são eliminados. Princípios aplicados:
- **Eliminate waste**: Remover ambiente DEV quando não em uso
- **Right-size**: CloudTrail com Data Events era overkill para o projeto
- **Architecture optimization**: Usar métricas nativas (CloudFront) ao invés de soluções caras (CloudTrail)

### CloudTrail Data Events vs Management Events

| Tipo | Custo | O que registra |
|------|-------|----------------|
| Management Events | Gratuito (1 trail) | Create/Delete/Modify recursos |
| Data Events (S3) | $0.10 por 100K eventos | GetObject, PutObject |

Data Events geram volume massivo em sites com tráfego — cada request do CloudFront ao S3 gera um evento. Para um site com 1000 acessos/dia, são 30K eventos/mês apenas de leitura.

### Terraform Destroy

Comando que remove todos os recursos gerenciados por um state:
```bash
terraform destroy -auto-approve
```

**Importante**: Só destrói recursos no state. Não afeta outros states (PROD não é afetado por destroy no DEV).

### Recursos com Nomes Errados

Quando o PROD foi criado usando o mesmo state que o DEV, os recursos herdaram nomes `*-dev-*`. O `terraform apply` com `environment = "prod"` detectou a diferença e recriou os recursos com nomes corretos. Recursos que não suportam rename in-place são destruídos e recriados.

---

## ⚙️ Estado final da infraestrutura

### PROD (ativo)

```
www.cloudtrilhas.com.br
├── CloudFront (E16GA24I7417C2)
├── S3 (materiais-e-trilhas-de-estudos)
├── Route 53 (cloudtrilhas.com.br)
├── ACM (certificado TLS)
├── API Gateway → Lambda register_lead → DynamoDB
├── EventBridge → SQS → Lambda hello → SNS
├── Lambda download_metrics (inativa sem CloudTrail)
├── CloudWatch Dashboard + 8 Alarmes
└── SNS (notificações)
```

### DEV (destruído — pode ser recriado a qualquer momento)

```bash
cd environments/dev
terraform init
terraform apply  # Recria toda a infra DEV em minutos
```

### SHARED (mantido)

```
OIDC Provider + IAM Role para GitHub Actions
```

---

## 💰 Impacto financeiro

### Antes (Junho/2026)

| Serviço | Custo/mês |
|---------|-----------|
| S3 (CloudTrail logs) | ~$5.50 |
| CloudFront (DEV + PROD) | ~$3.72 |
| Route 53 (2 zonas) | ~$1.00 |
| CloudWatch (16 alarmes) | ~$1.60 |
| **Total** | **~$12-15/mês** |

### Depois

| Serviço | Custo/mês |
|---------|-----------|
| S3 (site estático apenas) | ~$0.05 |
| CloudFront (PROD apenas) | ~$0.10 |
| Route 53 (1 zona) | ~$0.50 |
| CloudWatch (8 alarmes) | ~$0.80 |
| **Total** | **~$1.45/mês** |

**Economia: ~$10-13/mês (85-90% de redução)**

---

## 📚 Documentação oficial

- https://docs.aws.amazon.com/awscloudtrail/latest/userguide/cloudtrail-concepts.html#cloudtrail-concepts-events
- https://aws.amazon.com/cloudtrail/pricing/
- https://developer.hashicorp.com/terraform/cli/commands/destroy
- https://aws.amazon.com/aws-cost-management/

---

## 🧪 Como validar

```bash
# Verificar que PROD funciona
curl -I https://www.cloudtrilhas.com.br
# Resultado: 200 OK

# Verificar que DEV não existe mais
curl -I https://www.dev.cloudtrilhas.com.br
# Resultado: DNS não resolve ou 403

# Verificar recursos PROD com nomes corretos
aws lambda list-functions --query "Functions[?contains(FunctionName, 'prod')].[FunctionName]" --output text

# Verificar que CloudTrail não existe mais
aws cloudtrail describe-trails --query "trailList[?contains(Name, 'Serverless')]"
# Resultado: vazio
```

---

## 📈 Resultado esperado

- ✅ Custo reduzido de ~$15 para ~$1.45/mês
- ✅ PROD funcionando com nomes corretos (`*-prod-*`)
- ✅ DEV destruído (recriável em minutos quando necessário)
- ✅ CloudTrail removido (principal fonte de custo)
- ✅ Governança financeira aplicada
- ✅ Site `www.cloudtrilhas.com.br` funcionando normalmente

---

## 🚀 Próximos passos

- Monitorar custos no próximo ciclo de faturamento para confirmar redução
- Quando precisar testar: `cd environments/dev && terraform apply`
- Após testes: `terraform destroy` no DEV novamente
- Considerar remover `download_metrics` Lambda (inativa sem CloudTrail)
