# Fase 3 — Observabilidade com CloudWatch Logs

## 🎯 Objetivo

Implementar observabilidade básica da função Lambda utilizando CloudWatch Logs, garantindo visibilidade sobre execuções, erros e comportamento da aplicação serverless.

---

## 🏗️ O que foi criado

- Log Group dedicado no CloudWatch para a Lambda
- Retenção de logs configurada (14 dias)
- Permissões IAM para escrita de logs (`AWSLambdaBasicExecutionRole`)
- Estrutura de observabilidade base para o projeto

---

## 🧠 Conceitos importantes

### CloudWatch Logs

Serviço gerenciado da AWS para coleta, armazenamento e consulta de logs. Cada serviço AWS pode enviar logs para o CloudWatch, permitindo análise centralizada do comportamento da aplicação.

### Log Group

Agrupamento lógico de logs. Cada função Lambda possui seu próprio Log Group no formato `/aws/lambda/<function-name>`. Dentro dele, cada execução gera um Log Stream individual.

### Log Stream

Sequência de eventos de log de uma única execução. Cada invocação da Lambda cria um novo stream com timestamp, facilitando a análise de execuções específicas.

### Retenção de Logs

Por padrão, logs no CloudWatch são retidos indefinidamente (gerando custos). Configurar retenção (ex: 14 dias) é uma prática de otimização de custos e governança.

### Observabilidade

Capacidade de entender o estado interno de um sistema a partir de suas saídas externas. Os três pilares são: **Logs** (eventos), **Métricas** (números) e **Traces** (fluxos). Esta fase implementa o primeiro pilar.

---

## ⚙️ Como funciona

```
Lambda é invocada
        ↓
Código executa print() ou logging
        ↓
CloudWatch Agent captura stdout/stderr
        ↓
Eventos são gravados no Log Stream
        ↓
Log Stream é armazenado no Log Group
        ↓
Logs disponíveis para consulta e alarmes
```

A policy `AWSLambdaBasicExecutionRole` concede automaticamente as permissões `logs:CreateLogGroup`, `logs:CreateLogStream` e `logs:PutLogEvents`.

---

## 📁 Arquivos principais

| Arquivo | Função |
|---------|--------|
| `modules/lambda/main.tf` | Criação do Log Group com retenção |
| `lambda_src/hello_lambda/app.py` | Código com prints para log |

---

## 📚 Documentação oficial

- https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/cloudwatch_log_group
- https://docs.aws.amazon.com/lambda/latest/dg/monitoring-cloudwatchlogs.html
- https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/WhatIsCloudWatchLogs.html

---

## 🧪 Como testar

```bash
# Invocar a Lambda
aws lambda invoke \
  --function-name Terraform-Serverless-dev-hello-lambda \
  --payload '{}' \
  response.json

# Consultar logs via CLI
aws logs tail /aws/lambda/Terraform-Serverless-dev-hello-lambda --follow
```

Ou via Console:
1. CloudWatch → Log Groups
2. Selecionar `/aws/lambda/Terraform-Serverless-dev-hello-lambda`
3. Abrir o Log Stream mais recente
4. Validar eventos de execução

---

## 📈 Resultado esperado

- Log Group criado automaticamente pelo Terraform
- Cada invocação gera um novo Log Stream
- Logs contêm: START, END, REPORT e outputs do código
- Retenção configurada para controle de custos
