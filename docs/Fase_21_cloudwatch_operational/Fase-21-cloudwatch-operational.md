# Fase 21 — CloudWatch Operational (Dashboard + Alarmes)

## 🎯 Objetivo

Criar monitoramento operacional centralizado com dashboard e alarmes automáticos para todos os serviços da aplicação CloudTrilhas, permitindo detecção proativa de problemas e resposta rápida a incidentes.

---

## 🏗️ O que foi criado

- Dashboard operacional com widgets para todos os serviços
- 8 alarmes CloudWatch com integração SNS
- Monitoramento de Lambda, API Gateway, DynamoDB, SQS, SNS e CloudFront
- Notificações automáticas por email para eventos críticos
- Módulo Terraform (`modules/cloudwatch_operational/`)

---

## 🧠 Conceitos importantes

### Dashboard Operacional

Diferente do dashboard de downloads (Fase 11), este painel monitora a **saúde da infraestrutura**: erros, latência, throttling e falhas de entrega.

### CloudWatch Alarms

Recurso que monitora uma métrica e executa ações quando um threshold é violado. Estados possíveis:
- **OK**: Métrica dentro do normal
- **ALARM**: Threshold violado → ação executada
- **INSUFFICIENT_DATA**: Dados insuficientes para avaliação

### Alarm Actions

Quando um alarme dispara, ele pode executar ações:
- Notificar SNS Topic (email)
- Executar Auto Scaling
- Executar Lambda

Neste projeto, todos os alarmes notificam via SNS → Email.

### Métricas Padrão vs Custom

- **Padrão**: Geradas automaticamente pela AWS (Lambda Errors, API 5XX, etc.)
- **Custom**: Criadas pela aplicação (PDFDownloads — Fase 10)

Esta fase utiliza exclusivamente métricas padrão (custo zero adicional).

---

## 📊 Alarmes implementados

| # | Serviço | Métrica | Condição | Severidade |
|---|---------|---------|----------|------------|
| 1 | Lambda (register_lead) | Errors | > 0 | Alta |
| 2 | Lambda (download_metrics) | Errors | > 0 | Alta |
| 3 | API Gateway | 5XXError | > 0 | Crítica |
| 4 | DynamoDB | WriteThrottleEvents | > 0 | Alta |
| 5 | SQS DLQ | ApproximateNumberOfMessagesVisible | > 0 | Alta |
| 6 | SNS | NumberOfNotificationsFailed | > 0 | Média |
| 7 | CloudFront | 5xxErrorRate | > 1% | Alta |
| 8 | Lambda (register_lead) | Duration | > 5000ms | Média |

---

## 📊 Widgets do Dashboard

| Widget | Serviço | Métricas |
|--------|---------|----------|
| Lambda Errors | Lambda | Errors por função |
| Lambda Duration | Lambda | Duration (p50, p99) |
| API Gateway | API GW | Requests, 4XX, 5XX |
| DynamoDB | DynamoDB | Read/Write Throttle |
| SQS | SQS | Messages Visible (fila + DLQ) |
| CloudFront | CloudFront | Requests, Error Rate |
| SNS | SNS | Notifications Failed |

---

## ⚙️ Como funciona

```
Serviços AWS emitem métricas automaticamente
        ↓
CloudWatch coleta e armazena métricas
        ↓
Alarmes avaliam métricas a cada período (60s)
        ↓
Threshold violado → Estado muda para ALARM
        ↓
Ação executada → SNS → Email
        ↓
Dashboard exibe estado em tempo real
```

---

## 📁 Arquivos principais

| Arquivo | Função |
|---------|--------|
| `modules/cloudwatch_operational/main.tf` | Dashboard + Alarmes |
| `modules/cloudwatch_operational/variables.tf` | Nomes dos recursos |

---

## 📚 Documentação oficial

- https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/cloudwatch_metric_alarm
- https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/cloudwatch_dashboard
- https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/AlarmThatSendsEmail.html

---

## 🧪 Como testar

```bash
# Verificar alarmes criados
aws cloudwatch describe-alarms \
  --alarm-name-prefix "Terraform-Serverless-dev"

# Forçar erro na Lambda (payload inválido)
aws lambda invoke \
  --function-name Terraform-Serverless-dev-register-lead \
  --payload '{"body": "invalid"}' \
  response.json

# Verificar alarme disparado
aws cloudwatch describe-alarms \
  --state-value ALARM
```

Dashboard: CloudWatch → Dashboards → `Terraform-Serverless-dev-operational-dashboard`

---

## 📈 Resultado esperado

- Visibilidade operacional completa em um único painel
- Alertas automáticos para qualquer anomalia
- Tempo de detecção de problemas: < 1 minuto
- Notificação por email para resposta rápida
- Custo mínimo (métricas padrão são gratuitas, alarmes ~$0.10/mês cada)
