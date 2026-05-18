# Fase 11 — CloudWatch Dashboard

## 🎯 Objetivo

Criar um dashboard visual no Amazon CloudWatch para monitorar métricas de downloads dos materiais PDF disponibilizados no portal de estudos.

---

## 🏗️ O que foi criado

* Dashboard customizado no CloudWatch
* Widgets para visualização de downloads
* Métricas customizadas utilizando CloudWatch Metrics
* Visualização em tempo real dos downloads dos PDFs

---

## 🧠 Conceitos importantes

### CloudWatch Dashboard
Painel visual utilizado para monitoramento e observabilidade de aplicações e serviços AWS.

### CloudWatch Metrics
Métricas customizadas registradas automaticamente pela aplicação serverless.

### Metric Math
Recurso utilizado para realizar agregações e consultas avançadas de métricas.

### SEARCH()
Função utilizada para localizar automaticamente métricas com dimensões específicas.

---

## ⚙️ Como funciona

Quando um usuário realiza o download de um PDF:

1. O S3 registra o evento
2. O CloudTrail captura o `GetObject`
3. O EventBridge processa o evento
4. A Lambda de métricas registra uma métrica customizada
5. O CloudWatch Dashboard exibe os dados em tempo real

---

## 📚 Documentação oficial

* https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/cloudwatch_dashboard
* https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/CloudWatch_Dashboards.html
* https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/using-metric-math.html

---

## 🧪 Como testar

### Realizar download do PDF

Acessar o portal e baixar o material disponível.

### Verificar Dashboard

Acessar:

CloudWatch → Dashboards

Abrir:

Terraform-Serverless-dev-downloads-dashboard

### Validar gráficos

Verificar:

* Total de downloads
* Série temporal
* Downloads por material

---

## 📈 Resultado esperado

O dashboard deve exibir métricas em tempo real após novos downloads realizados no portal.