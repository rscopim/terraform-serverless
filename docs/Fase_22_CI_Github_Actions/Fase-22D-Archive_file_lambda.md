# Fase 22D — Empacotamento Lambda com archive_file

## 🎯 Objetivo

Migrar o empacotamento das funções Lambda de comandos manuais no workflow para o provider `archive_file` do Terraform, garantindo que o mesmo processo seja usado localmente e no CI/CD.

---

## 🏗️ O que foi implementado

- Provider `archive` configurado nos módulos Lambda
- `data "archive_file"` para gerar ZIPs automaticamente
- `source_code_hash` para detectar mudanças no código
- Upload/download de artifacts entre jobs do workflow
- Remoção de comandos `zip` manuais do workflow

---

## 🧠 Conceitos importantes

### Provider archive_file

Data source do Terraform que empacota arquivos em ZIP durante o plan/apply:

```hcl
data "archive_file" "lambda_zip" {
  type        = "zip"
  source_file = var.lambda_source_file
  output_path = var.lambda_output_path
}

resource "aws_lambda_function" "this" {
  filename         = data.archive_file.lambda_zip.output_path
  source_code_hash = data.archive_file.lambda_zip.output_base64sha256
}
```

### Por que migrar?

| Antes (manual) | Depois (archive_file) |
|----------------|----------------------|
| ZIP gerado no workflow | ZIP gerado pelo Terraform |
| Lógica duplicada | Processo unificado |
| Propenso a erros de path | Paths definidos em variáveis |
| Workflow complexo | Workflow simples |

### Artifacts entre Jobs

GitHub Actions runners são efêmeros — cada job roda em uma máquina diferente. Para compartilhar arquivos entre jobs:

```yaml
# Job 1: Plan
- uses: actions/upload-artifact@v4
  with:
    name: lambda-zips
    path: environments/dev/*.zip

# Job 2: Apply
- uses: actions/download-artifact@v4
  with:
    name: lambda-zips
    path: environments/dev
```

### Problema dos Runners Efêmeros

```
Job: Terraform Plan (Runner #1)
  → archive_file gera ZIPs
  → Plan salvo como artifact
  → Runner descartado ❌ (ZIPs perdidos)

Job: Terraform Apply (Runner #2)
  → Download plan artifact
  → ❌ ZIPs não existem → Apply falha
```

**Solução**: Upload dos ZIPs como artifacts no job de Plan.

---

## ⚙️ Fluxo corrigido

```
Job: Terraform Plan
  ├── archive_file gera ZIPs
  ├── terraform plan -out=tfplan
  ├── Upload artifact: tfplan
  └── Upload artifact: *.zip
        ↓
Job: Terraform Apply
  ├── Download artifact: tfplan
  ├── Download artifact: *.zip
  └── terraform apply tfplan ✅
```

---

## 📁 Arquivos principais

| Arquivo | Função |
|---------|--------|
| `modules/lambda/main.tf` | archive_file + Lambda |
| `modules/register_lead_lambda/main.tf` | archive_file + Lambda |
| `modules/download_metrics/main.tf` | archive_file + Lambda |
| `.github/workflows/terraform-ci.yml` | Upload/download artifacts |

---

## 📚 Documentação oficial

- https://registry.terraform.io/providers/hashicorp/archive/latest/docs/data-sources/file
- https://docs.github.com/en/actions/using-workflows/storing-workflow-data-as-artifacts

---

## 🧪 Lambdas validadas

| Função | Módulo | Status |
|--------|--------|--------|
| hello_lambda | modules/lambda | ✅ |
| register_lead | modules/register_lead_lambda | ✅ |
| download_metrics | modules/download_metrics | ✅ |

---

## 📈 Resultado esperado

- Empacotamento controlado pelo Terraform (não pelo workflow)
- Mesmo processo local e CI/CD
- Detecção automática de mudanças no código via hash
- Pipeline mais limpa e profissional
- Menos pontos de falha no workflow
