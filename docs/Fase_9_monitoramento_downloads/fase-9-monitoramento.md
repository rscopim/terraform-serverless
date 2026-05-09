# Fase 9 — Monitoramento de downloads de materiais

## 🎯 Objetivo

Monitorar downloads de arquivos PDF no S3 e enviar notificação via SNS.

## 🏗️ O que foi criado

* CloudTrail (data events para S3)
* EventBridge Rule com filtro por .pdf
* Integração com SNS

## 🧠 Conceitos importantes

* Data Events: eventos de leitura de objetos no S3
* Event Pattern: filtro por tipo de evento
* Observabilidade: monitoramento de ações do usuário

## ⚙️ Como funciona

Quando um usuário realiza download de um PDF, o evento é registrado no CloudTrail, capturado pelo EventBridge e enviado para o SNS.

## 🧪 Como testar

1. Acessar o site
2. Baixar um PDF
3. Verificar recebimento de email