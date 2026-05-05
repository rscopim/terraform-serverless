# Fase 7 — EventBridge (Arquitetura orientada a eventos)

## 🎯 Objetivo

Implementar um sistema de eventos utilizando EventBridge para disparar processamento de forma desacoplada.

## 🏗️ O que foi criado

* EventBridge Rule
* Integração com SQS
* Permissão para envio de mensagens

## 🧠 Conceitos importantes

* EventBridge: roteador de eventos
* Event Pattern: filtro de eventos
* Target: destino do evento

## ⚙️ Como funciona

Eventos são enviados ao EventBridge, que filtra e direciona para a fila SQS, iniciando o fluxo de processamento.

## 📚 Documentação oficial

* https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/cloudwatch_event_rule

## 🧪 Como testar

1. Enviar evento via AWS CLI
2. Validar execução da Lambda
3. Verificar notificação via SNS