# Fase 12 — API Gateway

## 🎯 Objetivo

Criar uma API HTTP utilizando Amazon API Gateway para receber requisições do frontend do portal de estudos antes da liberação do download dos materiais.

---

## 🏗️ O que foi criado

* API HTTP (API Gateway v2)
* Endpoint `/leads`
* Integração API Gateway → Lambda
* Configuração CORS
* Permissão para invocação da Lambda

---

## 🧠 Conceitos importantes

### API Gateway
Serviço gerenciado utilizado para criação e gerenciamento de APIs serverless.

### HTTP API
Versão simplificada e otimizada do API Gateway para aplicações modernas.

### AWS_PROXY
Modelo de integração onde o API Gateway encaminha o payload completo para a Lambda.

### CORS
Configuração necessária para permitir chamadas do frontend para a API.

---

## ⚙️ Como funciona

Quando o usuário preenche o formulário no portal:

1. O frontend envia uma requisição HTTP POST
2. O API Gateway recebe a requisição
3. A API encaminha os dados para a Lambda
4. A Lambda processa os dados
5. A resposta é retornada ao frontend

---

## 📚 Documentação oficial

* https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/apigatewayv2_api
* https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/apigatewayv2_route
* https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/apigatewayv2_integration

---

## 🧪 Como testar

### Obter endpoint da API

```bash
terraform output leads_api_endpoint

$body = @{
  name = "Teste Usuario"
  email = "teste@example.com"
  consent = $true
  material = "orientacoes-gerais-aws-caf.pdf"
} | ConvertTo-Json

Invoke-RestMethod `
  -Uri "<ENDPOINT_API>" `
  -Method POST `
  -Body $body `
  -ContentType "application/json"