# Fase 4 — SQS (Fila de Mensagens)

## 🎯 Objetivo

Criar uma fila de mensagens para processamento assíncrono utilizando AWS SQS.

## 🏗️ O que foi criado

* Fila principal (SQS)
* Dead Letter Queue (DLQ)
* Configuração de redrive policy

## 🧠 Conceitos importantes

* SQS: fila de mensagens gerenciada pela AWS
* DLQ: fila para mensagens com erro
* Redrive policy: regra de envio para DLQ após falhas

## ⚙️ Como funciona

As mensagens são enviadas para a fila principal e processadas posteriormente.

Caso uma mensagem falhe múltiplas vezes, ela é automaticamente enviada para a DLQ.

## 📚 Documentação oficial

* https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/sqs_queue

## 🧪 Como testar

1. Criar infraestrutura com Terraform
2. Enviar mensagem via AWS CLI
3. Ler mensagem da fila
4. Validar comportamento da fila