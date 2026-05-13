# Fase 10 — Métricas de Downloads com CloudWatch

## 🎯 Objetivo

Registrar métricas customizadas no CloudWatch sempre que um PDF for baixado no portal de estudos.

## 🏗️ O que foi criado

* Lambda para processar eventos de download
* Permissão para EventBridge invocar a Lambda
* Métrica customizada no CloudWatch
* Integração EventBridge → Lambda → CloudWatch Metrics

## 🧠 Conceitos importantes

* CloudWatch Custom Metrics: métricas criadas pela aplicação
* PutMetricData: operação usada para publicar métricas
* EventBridge Target: destino acionado por uma regra
* Observabilidade: capacidade de medir o comportamento do sistema

## ⚙️ Como funciona

Quando um PDF é baixado, o CloudTrail registra o evento `GetObject`.

O EventBridge captura esse evento e envia para dois destinos:

* SNS, para notificação por e-mail
* Lambda, para registrar uma métrica customizada no CloudWatch

## 📚 Documentação oficial

* https://docs.aws.amazon.com/AmazonCloudWatch/latest/APIReference/API_PutMetricData.html
* https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/lambda_permission
* https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/cloudwatch_event_target
* https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/cloudwatch_dashboard

## 🧪 Como testar

1. Acessar o site
2. Baixar o PDF disponível
3. Verificar se o e-mail foi recebido
4. Acessar CloudWatch Metrics
5. Validar a métrica `PDFDownloads`