# Fase 10 — Métricas de Downloads com CloudWatch Custom Metrics

## 🎯 Objetivo

Registrar métricas customizadas no CloudWatch sempre que um PDF for baixado, permitindo visualização quantitativa dos downloads por material, análise de tendências e criação de alarmes baseados em uso.

---

## 🏗️ O que foi criado

- Lambda `download_metrics` para processar eventos de download
- Permissão para EventBridge invocar a Lambda
- Métrica customizada `PDFDownloads` no namespace `CloudTrilhas`
- Dimensão por nome do material baixado
- Módulo Terraform (`modules/download_metrics/`)

---

## 🧠 Conceitos importantes

### CloudWatch Custom Metrics

Métricas criadas pela aplicação (diferente das métricas padrão da AWS). Permitem medir qualquer indicador de negócio — neste caso, quantidade de downloads por material.

### PutMetricData

API do CloudWatch utilizada pela Lambda para publicar métricas customizadas. Cada chamada registra um datapoint com namespace, nome da métrica, dimensões e valor.

### Namespace

Agrupamento lógico de métricas. O namespace `CloudTrilhas` separa as métricas do projeto das métricas padrão da AWS.

### Dimensões

Atributos que segmentam uma métrica. A dimensão `Material` permite filtrar downloads por curso específico (ex: `docker-do-zero-ao-avancado.pdf`).

### Lambda como Target do EventBridge

O EventBridge invoca a Lambda diretamente quando um evento de download é detectado. A Lambda extrai o nome do arquivo do evento e registra a métrica.

---

## ⚙️ Como funciona

```
CloudTrail detecta GetObject (materiais/*.pdf)
        ↓
EventBridge captura o evento
        ↓
Lambda download_metrics é invocada
        ↓
Lambda extrai nome do arquivo do evento
        ↓
Lambda chama PutMetricData no CloudWatch
        ↓
Métrica registrada:
  Namespace: CloudTrilhas
  MetricName: PDFDownloads
  Dimension: Material = <nome-do-pdf>
  Value: 1
```

---

## 📁 Arquivos principais

| Arquivo | Função |
|---------|--------|
| `lambda_src/download_metrics/app.py` | Código da Lambda |
| `modules/download_metrics/main.tf` | Lambda + IAM + Permission |
| `modules/eventbridge/main.tf` | Target para Lambda |

---

## 🔐 Permissões IAM necessárias

```json
{
  "Effect": "Allow",
  "Action": "cloudwatch:PutMetricData",
  "Resource": "*"
}
```

---

## 📚 Documentação oficial

- https://docs.aws.amazon.com/AmazonCloudWatch/latest/APIReference/API_PutMetricData.html
- https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/publishingMetrics.html
- https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/lambda_permission

---

## 🧪 Como testar

1. Acessar o portal e baixar um PDF
2. Aguardar 2-5 minutos (latência CloudTrail + EventBridge)
3. Acessar CloudWatch → Metrics → Custom Namespaces → CloudTrilhas
4. Verificar métrica `PDFDownloads` com dimensão do material
5. Validar logs da Lambda em CloudWatch Logs

---

## 📈 Resultado esperado

- Cada download gera um datapoint no CloudWatch
- Métricas segmentadas por material permitem análise individual
- Dashboard pode consumir essas métricas para visualização
- Base para alarmes (ex: alertar se downloads caírem a zero)
- Observabilidade de negócio implementada com custo mínimo
