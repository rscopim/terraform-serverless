# Fase 6 — SNS (Notificações)

## 🎯 Objetivo

Adicionar notificação ao fluxo de processamento utilizando AWS SNS.

## 🏗️ O que foi criado

* SNS Topic
* Permissão para Lambda publicar mensagens
* Integração com fluxo SQS → Lambda → SNS

## 🧠 Conceitos importantes

* SNS: serviço de publicação e notificação
* Pub/Sub: padrão de comunicação desacoplada
* Topic: canal de distribuição de mensagens

## ⚙️ Como funciona

Após o processamento da mensagem pela Lambda, uma notificação é enviada para o SNS Topic, que distribui a mensagem para os inscritos.

## 📚 Documentação oficial

* https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/sns_topic

## 🧪 Como testar

1. Criar subscription por email
2. Enviar mensagem para SQS
3. Verificar recebimento de email