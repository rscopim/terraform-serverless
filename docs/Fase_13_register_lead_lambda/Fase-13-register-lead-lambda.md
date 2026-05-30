# Fase 13 — Lambda de Captura de Leads

## 🎯 Objetivo

Criar a função Lambda `register_lead` responsável por validar dados do formulário, registrar o lead no DynamoDB com consentimento LGPD e retornar a URL dinâmica do PDF solicitado.

---

## 🏗️ O que foi criado

- Lambda `register_lead` com runtime Python 3.12
- Validação de campos obrigatórios (nome, email, consentimento)
- Registro no DynamoDB com timestamp e UUID
- Construção dinâmica da URL do PDF via variável de ambiente
- Retorno do `download_url` ao frontend
- IAM Role com permissões mínimas (DynamoDB PutItem)
- Módulo Terraform (`modules/register_lead_lambda/`)

---

## 🧠 Conceitos importantes

### Captura de Leads

Processo de coletar informações de contato de usuários interessados em um conteúdo. No CloudTrilhas, o usuário fornece nome e email em troca do PDF do curso.

### Consentimento LGPD

A Lei Geral de Proteção de Dados exige consentimento explícito antes da coleta de dados pessoais. O formulário inclui checkbox obrigatório e a Lambda valida esse campo antes de prosseguir.

### Variáveis de Ambiente na Lambda

Permitem parametrizar o comportamento da função sem alterar código:
- `TABLE_NAME`: Nome da tabela DynamoDB
- `PDF_BASE_URL`: URL base para construção do link de download

### URL Dinâmica de Download

A Lambda constrói a URL do PDF concatenando `PDF_BASE_URL` + `material`:
```python
download_url = f"{os.environ['PDF_BASE_URL']}/{material}"
```

Isso permite que o mesmo código funcione em DEV e PROD com URLs diferentes.

### UUID como Partition Key

Cada lead recebe um `lead_id` único gerado via `uuid.uuid4()`, garantindo unicidade sem risco de colisão.

---

## ⚙️ Como funciona

```
Frontend envia POST /leads com payload:
{name, email, consent, material}
        ↓
API Gateway invoca Lambda (AWS_PROXY)
        ↓
Lambda valida campos obrigatórios
        ↓
Verifica consent == true
        ↓
Gera UUID para lead_id
        ↓
Registra item no DynamoDB:
  - lead_id (PK)
  - name
  - email
  - material
  - consent
  - created_at (ISO 8601)
        ↓
Constrói download_url dinâmica
        ↓
Retorna 200 + {message, download_url}
        ↓
Frontend abre PDF em nova aba
```

---

## 📁 Arquivos principais

| Arquivo | Função |
|---------|--------|
| `lambda_src/register_lead/app.py` | Código da Lambda |
| `modules/register_lead_lambda/main.tf` | Lambda + IAM + Env vars |
| `modules/register_lead_lambda/variables.tf` | Table name, PDF URL |

---

## 🔐 Permissões IAM (Least Privilege)

```json
{
  "Effect": "Allow",
  "Action": "dynamodb:PutItem",
  "Resource": "<DYNAMODB_TABLE_ARN>"
}
```

---

## 📚 Documentação oficial

- https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/lambda_function
- https://docs.aws.amazon.com/lambda/latest/dg/configuration-envvars.html
- https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/GettingStarted.WriteItem.html

---

## 🧪 Como testar

```bash
# Verificar logs da Lambda
aws logs tail /aws/lambda/Terraform-Serverless-dev-register-lead --follow

# Verificar itens no DynamoDB
aws dynamodb scan --table-name Terraform-Serverless-dev-leads
```

Ou via portal:
1. Acessar qualquer página de curso
2. Preencher formulário de download
3. Confirmar que o PDF abre em nova aba
4. Verificar registro no DynamoDB

---

## 📈 Resultado esperado

- Formulário funcional em todas as 13 páginas de cursos
- Leads registrados no DynamoDB com todos os campos
- PDF correto aberto automaticamente após cadastro
- Validação impede registros sem consentimento
- URLs dinâmicas funcionam em DEV e PROD
