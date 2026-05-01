# Fase 3 — Observabilidade com CloudWatch

## 🎯 Objetivo

Visualizar e monitorar a execução da função Lambda utilizando logs no CloudWatch.

## 🏗️ O que foi utilizado

* AWS CloudWatch Logs
* AWS Lambda
* IAM Role com permissões de log

## 🧠 Conceitos importantes

* Log Group: agrupamento de logs da Lambda
* Log Stream: execução individual da função
* Observabilidade: capacidade de entender o comportamento do sistema

## ⚙️ Como funciona

A Lambda envia automaticamente logs para o CloudWatch utilizando a policy AWSLambdaBasicExecutionRole.

Cada execução da função gera um novo log stream dentro do log group correspondente.

## 📚 Documentação oficial

* https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/cloudwatch_log_group
* https://docs.aws.amazon.com/lambda/latest/dg/monitoring-cloudwatchlogs.html

## 🧪 Como testar

1. Executar a Lambda via AWS CLI
2. Acessar CloudWatch
3. Navegar até Log Groups
4. Selecionar o log da Lambda
5. Validar os logs da execução