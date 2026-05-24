# Fase 22D — Empacotamento Lambda com archive_file

## Objetivo

Evoluir o processo de empacotamento das funções Lambda do CloudTrilhas.
Antes, os arquivos `.zip` das Lambdas eram gerados manualmente dentro do GitHub Actions.
Nesta fase, o empacotamento passou a ser controlado pelo Terraform utilizando o provider `archive_file`.

---

# Cenário anterior


Fluxo anterior:
```text
GitHub Actions
↓
Create Lambda ZIP files
↓
terraform plan
↓
terraform apply
```

O workflow executava comandos como:
```bash
zip -r hello_lambda.zip ../../lambda_src/hello_lambda
zip -r register_lead.zip ../../lambda_src/register_lead
zip -r download_metrics.zip ../../lambda_src/download_metrics
```

Problema:
```text
A pipeline estava responsável por empacotar aplicação.
```

Isso deixava o workflow maior, mais acoplado e mais propenso a erros de caminho.

---

# Nova abordagem

Novo fluxo:
```text
Terraform
↓
archive_file
↓
gera o pacote ZIP
↓
aws_lambda_function usa o ZIP gerado
```

Com isso, tanto o ambiente local quanto o GitHub Actions usam o mesmo processo.

---

# Provider utilizado

Provider:
```hcl
archive = {
  source  = "hashicorp/archive"
  version = "~> 2.7"
}
```

Organização adotada:
```text
providers.tf
```

Responsável por concentrar providers e versões.

---

# Estrutura dos módulos Lambda

As funções passaram a usar:
```hcl
data "archive_file" "lambda_zip" {
  type        = "zip"
  source_file = var.lambda_source_file
  output_path = var.lambda_output_path
}
```

E o recurso Lambda passou a usar:
```hcl
filename         = data.archive_file.lambda_zip.output_path
source_code_hash = data.archive_file.lambda_zip.output_base64sha256
```

---

# Lambdas ajustadas

Módulos validados:
```text
modules/lambda
modules/register_lead_lambda
modules/download_metrics
```

Funções:
```text
hello_lambda
register_lead
download_metrics
```

---

# Problema encontrado no GitHub Actions

Após remover o empacotamento manual do workflow, o `terraform plan` funcionava, mas o `terraform apply` falhava.

Erro:
```text
Error: reading ZIP file (./download_metrics.zip): no such file or directory
Error: reading ZIP file (./hello_lambda.zip): no such file or directory
Error: reading ZIP file (./register_lead.zip): no such file or directory
```

---

# Causa raiz

O GitHub Actions executa cada job em uma máquina temporária diferente.
Fluxo problemático:
```text
Job Terraform Plan
↓
Runner Ubuntu #1
↓
archive_file gera os ZIPs
↓
Job termina
↓
Runner é descartado

Job Terraform Apply
↓
Runner Ubuntu #2
↓
ZIPs não existem
↓
Apply falha
```

Conceito importante:
```text
Jobs diferentes não compartilham arquivos automaticamente.
```

---

# Correção aplicada

Foi necessário transportar os arquivos gerados no job `Terraform Plan` para o job `Terraform Apply`.

Solução:
```text
upload-artifact
download-artifact
```

Fluxo corrigido:
```text
Terraform Plan
↓
archive_file gera ZIPs
↓
Upload Terraform Plan
↓
Upload Lambda ZIP files
↓
Approval
↓
Terraform Apply
↓
Download Terraform Plan
↓
Download Lambda ZIP files
↓
Apply executa com sucesso
```

---

# Ajuste no workflow

No job `Terraform Plan`, foi adicionado:
```yaml
- name: Upload Lambda ZIP files
  uses: actions/upload-artifact@v4
  with:
    name: lambda-zips
    path: |
      environments/dev/hello_lambda.zip
      environments/dev/register_lead.zip
      environments/dev/download_metrics.zip
```

No job `Terraform Apply`, foi adicionado:
```yaml
- name: Download Lambda ZIP files
  uses: actions/download-artifact@v4
  with:
    name: lambda-zips
    path: environments/dev
```

---

# Resultado final

Fluxo final:
```text
Feature Branch
↓
Pull Request
↓
Terraform Plan
↓
archive_file gera pacotes Lambda
↓
Artifacts são salvos
↓
Merge Main
↓
Approval Production
↓
Download Artifacts
↓
Terraform Apply
↓
AWS atualizada
```

Resultado validado:
```text
Terraform Plan
✅

Terraform Apply
✅

Lambdas empacotadas com Terraform
✅

Pipeline funcionando
✅
```

---

# Benefícios obtidos

- Menos lógica manual no GitHub Actions
- Empacotamento controlado pelo Terraform
- Mesmo processo local e CI/CD
- Redução de erros de caminho
- Melhor padronização
- Pipeline mais profissional
- Entendimento do conceito de artifacts entre jobs

---

# Lições aprendidas

## GitHub Actions não preserva arquivos entre jobs

Cada job roda em um runner temporário diferente.

Para compartilhar arquivos entre jobs, é necessário usar:

```text
upload-artifact
download-artifact
```

---

## archive_file melhora o controle do empacotamento

O Terraform passa a ser responsável por gerar os pacotes das Lambdas.

Isso reduz dependência de comandos manuais no workflow.

---

## Plan e Apply precisam dos mesmos artefatos

Quando o `terraform plan` gera ou referencia arquivos locais, o `terraform apply` também precisa ter acesso aos mesmos arquivos.

---

# Próximos passos

Fase 23:
```text
Separação de ambientes DEV / PROD
```

Fase futura:
```text
Refatoração IAM modularizada
```

CloudTrilhas

Projeto educacional construído para estudo prático de Cloud Computing, DevOps e Arquitetura AWS.