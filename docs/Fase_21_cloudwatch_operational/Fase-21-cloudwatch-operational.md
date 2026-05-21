# Fase 21 — CloudWatch Operational Dashboard + Alarmes

## 🎯 Objetivo

Criar monitoramento operacional centralizado da aplicação CloudTrilhas utilizando Amazon CloudWatch, permitindo visualização em tempo real da saúde da aplicação e geração automática de alertas para eventos críticos.

O objetivo desta fase é aumentar observabilidade, confiabilidade operacional e capacidade de resposta a incidentes.

---

## 🏗️ O que foi criado

* Dashboard operacional CloudWatch
* Alarmes automáticos
* Monitoramento Lambda
* Monitoramento API Gateway
* Monitoramento DynamoDB
* Monitoramento SQS
* Monitoramento SNS
* Monitoramento CloudFront
* Integração SNS para notificações
* Painel centralizado operacional

---

## 🧠 Conceitos importantes

### CloudWatch Dashboard

Painel visual centralizado para acompanhamento operacional dos recursos AWS.
Permite acompanhar:
* Métricas
* Alarmes
* Performance
* Eventos operacionais

---

### CloudWatch Alarm

Recurso responsável por monitorar métricas e executar ações automáticas.
Exemplo:
```text
Lambda Errors > 0
```

Ação:
```text
Notificar SNS
```

---

### Observabilidade

Capacidade de entender o comportamento do sistema utilizando:
* Logs
* Métricas
* Alarmes
* Dashboards

---

### SNS Notifications

Integração utilizada para envio automático de alertas.
Fluxo:

```text
CloudWatch
↓
Alarme
↓
SNS
↓
E-mail
```

---

## ⚙️ Como funciona

Fluxo operacional:
```text
Aplicação CloudTrilhas
↓
CloudWatch Metrics
↓
CloudWatch Alarms
↓
SNS
↓
Notificação E-mail
+
Dashboard Operacional
```

---

## 📊 Recursos monitorados

### CloudFront

Métricas:
* Requests
* 4XX Error Rate
* 5XX Error Rate

Objetivo:
Monitoramento CDN e erros de entrega.

---

### API Gateway

Métricas:
* Count
* 4XX
* 5XX

Objetivo:
Monitoramento backend HTTP.

---

### Lambda

Métricas:
* Errors
* Duration
* Invocations

Objetivo:
Monitoramento execução serverless.

---

### DynamoDB

Métricas:
* ReadThrottleEvents
* WriteThrottleEvents

Objetivo:
Monitoramento gargalos banco de dados.

---

### SQS

Métricas:

* ApproximateNumberOfMessagesVisible
Objetivo:
Monitoramento filas.

---

### DLQ

Métricas:
* ApproximateNumberOfMessagesVisible
Objetivo:
Identificar falhas processamento.

---

### SNS

Métricas:
* NumberOfNotificationsFailed
Objetivo:
Validar entrega notificações.

---

## 🚨 Alarmes implementados

Lambda:
```text
Errors > 0
```

API Gateway:
```text
5XX > 0
```

DynamoDB:
```text
WriteThrottleEvents > 0
```

DLQ:
```text
Messages Visible > 0
```

SNS:
```text
Notifications Failed > 0
```

CloudFront:
```text
5XX Error Rate > 1%
```

---

## 📚 Documentação oficial

* https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/cloudwatch_dashboard
* https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/cloudwatch_metric_alarm
* https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/WhatIsCloudWatch.html
* https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/CloudWatch_Dashboards.html

---

## 🧪 Como validar

Abrir:
```text
CloudWatch
```

Selecionar:
```text
Dashboards
```

Validar:
```text
Terraform-Serverless-dev-operational-dashboard
```

---

Abrir:
```text
CloudWatch
↓
Alarms
```

Validar alarmes criados.

---

Executar testes:
* Erro Lambda
* API inválida
* CloudFront URL inexistente

Resultado esperado:
```text
Alarme disparado
```

SNS:
```text
Notificação enviada
```

---

## 📈 Resultado esperado

Ao final desta fase o CloudTrilhas deve possuir:
* Observabilidade operacional
* Dashboard centralizado
* Alertas automáticos
* Resposta rápida a incidentes
* Monitoramento aplicação ponta a ponta

---

## 📌 Observação operacional

Implementação realizada utilizando métricas padrão AWS.
Objetivo:
Baixo custo operacional mantendo observabilidade elevada.
