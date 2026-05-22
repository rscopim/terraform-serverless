# Fase 1 — Setup do Projeto Serverless



## 🎯 Objetivo

Preparar a base do projeto Terraform para suportar uma arquitetura serverless utilizando serviços AWS.

## ⚙️ Configurações do projeto

* Nome do projeto: Terraform-Serverless
* Região: us-west-2

## 🏗️ O que foi criado

* Estrutura inicial de diretórios
* Configuração do provider AWS
* Ambiente inicial (dev)

## 🧠 Conceitos importantes

* Provider: define qual provedor será utilizado (AWS)
* Ambiente: separação entre dev, prod, etc.
* Estrutura modular: organização para reutilização futura

## ⚙️ Como funciona

O Terraform foi configurado para utilizar o provider AWS na região definida pela variável `aws_region`.

Nenhum recurso foi criado nesta fase, pois o objetivo é apenas estruturar o projeto.

## 📚 Documentação oficial

* https://registry.terraform.io/providers/hashicorp/aws/latest/docs

## 🧪 Como testar

1. Acessar a pasta environments/dev
2. Executar terraform init
3. Executar terraform plan
4. Confirmar que não há recursos para criação