# Fase 11 — CloudWatch Dashboard de Downloads

## 🎯 Objetivo

Criar um dashboard visual no CloudWatch para monitorar métricas de downloads dos PDFs em tempo real, oferecendo visibilidade operacional sobre o uso da plataforma CloudTrilhas.

---

## 🏗️ O que foi criado

- Dashboard customizado no CloudWatch
- Widget de total de downloads (agregação)
- Widget de série temporal (downloads ao longo do tempo)
- Widget de downloads por material (segmentação)
- Uso de Metric Math e função SEARCH()
- Módulo Terraform (`modules/cloudwatch_dashboard/`)

---

## 🧠 Conceitos importantes

### CloudWatch Dashboard

Painel visual configurável que exibe métricas, alarmes e dados operacionais em widgets. Permite acompanhamento em tempo real sem necessidade de queries manuais.

### Metric Math

Recurso que permite realizar operações matemáticas sobre métricas (soma, média, percentil). Utilizado para agregar downloads de todos os materiais em um único número.

### Função SEARCH()

Função avançada que localiza automaticamente métricas com base em namespace, nome e dimensões. Útil quando novos materiais são adicionados — o dashboard os detecta automaticamente.

```
SEARCH('{CloudTrilhas,Material} MetricName="PDFDownloads"', 'Sum', 300)
```

### Widgets

Componentes visuais do dashboard:
- **Number**: Exibe um valor único (total de downloads)
- **Line**: Gráfico de linha temporal
- **Bar**: Gráfico de barras por dimensão

---

## ⚙️ Como funciona

```
Métricas registradas pela Lambda (Fase 10)
        ↓
CloudWatch armazena datapoints
        ↓
Dashboard consulta métricas via SEARCH()
        ↓
Widgets renderizam dados em tempo real
        ↓
Administrador visualiza uso da plataforma
```

---

## 📁 Arquivos principais

| Arquivo | Função |
|---------|--------|
| `modules/cloudwatch_dashboard/main.tf` | Dashboard JSON + Widgets |
| `modules/cloudwatch_dashboard/variables.tf` | Região, bucket, projeto |

---

## 📚 Documentação oficial

- https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/cloudwatch_dashboard
- https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/CloudWatch_Dashboards.html
- https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/using-metric-math.html
- https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/using-search-expressions.html

---

## 🧪 Como testar

1. Realizar download de PDFs no portal
2. Aguardar propagação das métricas (2-5 min)
3. Acessar: CloudWatch → Dashboards
4. Abrir: `Terraform-Serverless-dev-downloads-dashboard`
5. Validar:
   - Total de downloads atualizado
   - Gráfico temporal com novos pontos
   - Segmentação por material funcionando

---

## 📈 Resultado esperado

- Dashboard exibe métricas em tempo real
- Novos materiais são detectados automaticamente via SEARCH()
- Visibilidade sobre quais cursos são mais populares
- Base para decisões sobre conteúdo (quais cursos expandir)
- Custo zero adicional (dashboards são gratuitos no CloudWatch)
