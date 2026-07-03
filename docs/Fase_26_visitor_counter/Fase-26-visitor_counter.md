# Fase 26 — Visitor Counter (Contador de Visitantes)

## 🎯 Objetivo

Implementar um contador de visitantes para o CloudTrilhas utilizando arquitetura serverless na AWS.

A solução registra automaticamente a primeira visita de cada navegador, armazena o total de visitantes em uma tabela Amazon DynamoDB e disponibiliza esse número tanto para o portal quanto para o Dashboard Administrativo através de uma API HTTP.

---

## 🏗️ O que foi criado

- Tabela DynamoDB para armazenar o contador de visitantes
- AWS Lambda para leitura e incremento do contador
- API Gateway HTTP com endpoints GET e POST
- Integração com o site público
- Integração com o Dashboard Administrativo
- Controle utilizando Local Storage para evitar múltiplas contagens do mesmo navegador
- Ajuste da CloudFront Function para permitir o arquivo `config.js`
- Módulo Terraform (`modules/visitor_counter_lambda/`)

---

## 🧠 Conceitos importantes

### Visitor Counter

Componente responsável por contabilizar automaticamente os visitantes do portal.

O contador é incrementado apenas na primeira visita realizada por cada navegador.

---

### Amazon DynamoDB

O contador é armazenado em uma tabela DynamoDB contendo apenas um registro.

Estrutura:

```json
{
  "id": "hits",
  "count": 153
}
```

A operação de incremento utiliza o comando `UpdateItem`, evitando problemas de concorrência mesmo com múltiplos acessos simultâneos.

---

### AWS Lambda

A função Lambda possui duas responsabilidades principais:

- Consultar o total de visitantes (`GET`)
- Incrementar o contador (`POST`)

Todo o processamento ocorre sem necessidade de servidores dedicados.

---

### API Gateway (HTTP API)

A API disponibiliza três endpoints:

| Método | Endpoint | Função |
|---------|----------|--------|
| GET | `/counter` | Consulta o total de visitantes |
| POST | `/counter` | Incrementa o contador |
| OPTIONS | `/counter` | Suporte ao CORS |

---

### Local Storage

Para evitar múltiplas contagens do mesmo navegador, o frontend grava a chave:

```text
cloudtrilhas-visitor-counted
```

Enquanto essa chave existir, novas visitas não geram chamadas ao endpoint de incremento.

---

### CloudFront Function

Foi realizada uma melhoria na função de proteção da CloudFront.

Anteriormente qualquer arquivo iniciado por `config.` era bloqueado.

A regra passou a bloquear apenas arquivos potencialmente sensíveis:

- config.php
- config.asp
- config.aspx
- config.jsp

permitindo normalmente o carregamento do arquivo:

```
config.js
```

utilizado pelo frontend.

---

## ⚙️ Como funciona

```
Usuário acessa o CloudTrilhas
        ↓
JavaScript verifica Local Storage
        ↓
Primeira visita?
        ↓
Sim
        ↓
POST /counter
        ↓
API Gateway
        ↓
AWS Lambda
        ↓
DynamoDB (+1)
        ↓
Retorna sucesso
        ↓
Grava:

cloudtrilhas-visitor-counted=true
```

No Dashboard Administrativo:

```
Dashboard
        ↓
GET /counter
        ↓
API Gateway
        ↓
Lambda
        ↓
DynamoDB
        ↓
Total de visitantes
```

---

## 📁 Arquivos principais

| Arquivo | Função |
|---------|--------|
| `modules/visitor_counter_lambda/main.tf` | Lambda, IAM e CloudWatch Logs |
| `modules/visitor_counter_lambda/variables.tf` | Variáveis do módulo |
| `modules/visitor_counter_lambda/outputs.tf` | Outputs da Lambda |
| `lambda_src/visitor_counter/app.py` | Código da função Lambda |
| `modules/api_gateway/main.tf` | Endpoints GET, POST e OPTIONS |
| `modules/s3_static_site/main.tf` | Geração do arquivo config.js |
| `modules/cloudfront/block-invalid-requests.js` | Proteção na Edge da CloudFront |
| `static_site/app.js` | Registro automático do visitante |
| `static_site/admin/dashboard.html` | Exibição do contador no Dashboard |

---

## 📚 Documentação oficial

### Terraform

- https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/lambda_function
- https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/apigatewayv2_api
- https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/apigatewayv2_route
- https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/dynamodb_table

### AWS

- https://docs.aws.amazon.com/lambda/
- https://docs.aws.amazon.com/apigateway/
- https://docs.aws.amazon.com/amazondynamodb/
- https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/

---

## 🧪 Como testar

Consultar contador:

```bash
curl -X GET \
https://<api-id>.execute-api.us-west-2.amazonaws.com/counter
```

Incrementar contador:

```bash
curl -X POST \
https://<api-id>.execute-api.us-west-2.amazonaws.com/counter \
-H "Origin: https://www.cloudtrilhas.com.br"
```

Consultar tabela DynamoDB:

```bash
aws dynamodb get-item \
  --table-name cloudtrilhas-visitor-counter \
  --key '{"id":{"S":"hits"}}'
```

Verificar logs da Lambda:

```bash
aws logs tail \
/aws/lambda/Terraform-Serverless-prod-visitor-counter \
--follow
```

Validar Dashboard:

- Abrir o Dashboard Administrativo
- Confirmar a exibição do card "Visitantes"
- Comparar o valor exibido com o retorno da API

---

## 📈 Resultado esperado

- Contador funcionando automaticamente
- Apenas uma contagem por navegador
- Persistência dos dados no DynamoDB
- Integração com o Dashboard Administrativo
- Arquitetura totalmente serverless
- Baixo custo operacional
- Solução escalável e de fácil manutenção