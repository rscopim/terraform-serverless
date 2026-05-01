# Fase 5 — Integração Lambda com SQS

## 🎯 Objetivo

Integrar a função Lambda com a fila SQS para processamento automático de mensagens.

## 🏗️ O que foi criado

* Permissão IAM para Lambda acessar SQS
* Event Source Mapping entre SQS e Lambda

## 🧠 Conceitos importantes

* Event Source Mapping: ligação entre SQS e Lambda
* Processamento assíncrono
* Execução automática

## ⚙️ Como funciona

Quando uma mensagem é enviada para a fila SQS, a Lambda é automaticamente acionada para processar essa mensagem.

## 📚 Documentação oficial

* https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/lambda_event_source_mapping

## 🧪 Como testar

1. Enviar mensagem para SQS
2. Verificar execução automática da Lambda
3. Validar logs no CloudWatch