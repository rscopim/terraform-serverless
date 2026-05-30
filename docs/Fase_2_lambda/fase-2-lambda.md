# Fase 2 — Primeira Função Lambda

## 🎯 Objetivo

Criar a primeira função AWS Lambda utilizando Terraform, estabelecendo o padrão de empacotamento, permissões IAM e execução serverless que será replicado em todas as funções do projeto.

---

## 🏗️ O que foi criado

- Função AWS Lambda (`hello_lambda`) com runtime Python 3.12
- IAM Role com trust policy para o serviço Lambda
- Policy attachment com `AWSLambdaBasicExecutionRole`
- Empacotamento automático do código via provider `archive`
- Módulo Terraform reutilizável (`modules/lambda/`)

---

## 🧠 Conceitos importantes

### AWS Lambda

Serviço de computação serverless que executa código sob demanda, sem necessidade de provisionar ou gerenciar servidores. O custo é baseado no número de invocações e tempo de execução — ideal para workloads event-driven.

### Runtime e Handler

- **Runtime**: Ambiente de execução (Python 3.12 neste projeto)
- **Handler**: Ponto de entrada da função no formato `arquivo.função` (ex: `app.lambda_handler`)

### IAM Role (Execution Role)

Toda Lambda precisa de uma IAM Role que define quais serviços AWS ela pode acessar. A trust policy permite que o serviço `lambda.amazonaws.com` assuma essa role durante a execução.

### Provider Archive

O provider `archive` do Terraform empacota o código-fonte em um arquivo ZIP automaticamente. Isso elimina a necessidade de gerar ZIPs manualmente e garante que o hash do pacote seja rastreado para detectar mudanças.

### source_code_hash

Atributo que permite ao Terraform detectar quando o código da Lambda foi alterado. Sem ele, o Terraform não atualizaria a função mesmo após mudanças no código-fonte.

---

## ⚙️ Como funciona

```
Código Python (lambda_src/hello_lambda/app.py)
        ↓
Provider archive empacota em ZIP
        ↓
Terraform cria IAM Role + Policy
        ↓
Terraform cria Lambda Function
        ↓
Lambda pronta para invocação
```

O módulo `modules/lambda/` encapsula toda essa lógica, recebendo como variáveis o caminho do código-fonte, o nome do projeto e as permissões necessárias.

---

## 📁 Arquivos principais

| Arquivo | Função |
|---------|--------|
| `lambda_src/hello_lambda/app.py` | Código da função |
| `modules/lambda/main.tf` | Recursos Lambda + IAM |
| `modules/lambda/variables.tf` | Variáveis do módulo |
| `modules/lambda/outputs.tf` | Outputs (ARN, nome) |

---

## 📚 Documentação oficial

- https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/lambda_function
- https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/iam_role
- https://registry.terraform.io/providers/hashicorp/archive/latest/docs/data-sources/file
- https://docs.aws.amazon.com/lambda/latest/dg/lambda-python.html

---

## 🧪 Como testar

```bash
# Provisionar infraestrutura
cd environments/dev
terraform apply

# Invocar a Lambda via AWS CLI
aws lambda invoke \
  --function-name Terraform-Serverless-dev-hello-lambda \
  --payload '{}' \
  response.json

# Verificar resposta
cat response.json
```

---

## 📈 Resultado esperado

- Lambda criada e visível no console AWS
- Invocação retorna statusCode 200
- Logs gerados automaticamente no CloudWatch
- Módulo pronto para reutilização nas próximas fases
