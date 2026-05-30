# Fase 12 — API Gateway (HTTP API)

## 🎯 Objetivo

Criar uma API HTTP serverless utilizando Amazon API Gateway v2 para receber dados do formulário de cadastro do portal CloudTrilhas, servindo como ponto de entrada para o backend de captura de leads.

---

## 🏗️ O que foi criado

- HTTP API (API Gateway v2) com stage `$default` e auto-deploy
- Rota `POST /leads` para recebimento de dados
- Integração AWS_PROXY com Lambda `register_lead`
- Configuração CORS para permitir chamadas do frontend
- Permissão para API Gateway invocar a Lambda
- Módulo Terraform (`modules/api_gateway/`)

---

## 🧠 Conceitos importantes

### API Gateway HTTP API (v2)

Versão otimizada do API Gateway para APIs modernas. Comparado ao REST API (v1):
- **70% mais barato**
- **Latência menor** (~10ms overhead vs ~30ms)
- **Auto-deploy** habilitado por padrão
- **CORS nativo** sem necessidade de OPTIONS manual

### Integração AWS_PROXY

Modelo onde o API Gateway encaminha o request completo (headers, body, path, query) para a Lambda como um evento JSON. A Lambda retorna um objeto com statusCode, headers e body.

### CORS (Cross-Origin Resource Sharing)

Configuração obrigatória quando o frontend (hospedado em `cloudtrilhas.com.br`) faz requisições para a API (hospedada em `execute-api.amazonaws.com`). Sem CORS, o navegador bloqueia a requisição.

Configuração aplicada:
- `allow_origins`: domínio do portal
- `allow_methods`: POST
- `allow_headers`: Content-Type

### Stage e Auto-Deploy

O stage `$default` com auto-deploy garante que qualquer alteração na API seja publicada automaticamente, sem necessidade de deploy manual.

---

## ⚙️ Como funciona

```
Usuário preenche formulário no portal
        ↓
JavaScript (app.js) envia POST /leads
        ↓
API Gateway recebe a requisição
        ↓
Valida CORS headers
        ↓
Encaminha payload para Lambda (AWS_PROXY)
        ↓
Lambda processa e retorna resposta
        ↓
API Gateway retorna response ao frontend
```

---

## 📁 Arquivos principais

| Arquivo | Função |
|---------|--------|
| `modules/api_gateway/main.tf` | API + Route + Integration + CORS |
| `modules/api_gateway/variables.tf` | Lambda ARN e nome |
| `modules/api_gateway/outputs.tf` | Endpoint URL, API ID |
| `static_site/app.js` | Frontend que consome a API |

---

## 📚 Documentação oficial

- https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/apigatewayv2_api
- https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/apigatewayv2_route
- https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/apigatewayv2_integration
- https://docs.aws.amazon.com/apigateway/latest/developerguide/http-api.html

---

## 🧪 Como testar

```powershell
# Obter endpoint
terraform output leads_api_endpoint

# Testar via PowerShell
$body = @{
  name = "Teste Usuario"
  email = "teste@example.com"
  consent = $true
  material = "docker-do-zero-ao-avancado.pdf"
} | ConvertTo-Json

Invoke-RestMethod `
  -Uri "<ENDPOINT>/leads" `
  -Method POST `
  -Body $body `
  -ContentType "application/json"
```

Resposta esperada:
```json
{
  "message": "Lead registrado com sucesso",
  "download_url": "https://www.dev.cloudtrilhas.com.br/materiais/docker-do-zero-ao-avancado.pdf"
}
```

---

## 📈 Resultado esperado

- API acessível publicamente via HTTPS
- CORS configurado para o domínio do portal
- Requisições POST processadas pela Lambda
- Resposta com URL de download retornada ao frontend
- Latência < 100ms para o endpoint
