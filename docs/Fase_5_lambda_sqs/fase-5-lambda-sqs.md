# Fase 5 — Integração Lambda + SQS

## 🎯 Objetivo

Integrar a função Lambda com a fila SQS utilizando Event Source Mapping, criando um fluxo de processamento assíncrono onde mensagens na fila disparam automaticamente a execução da Lambda.

---

## 🏗️ O que foi criado

- Event Source Mapping entre SQS e Lambda
- Permissões IAM para Lambda consumir mensagens da fila (`sqs:ReceiveMessage`, `sqs:DeleteMessage`, `sqs:GetQueueAttributes`)
- Configuração de batch size para processamento em lote
- Fluxo completo: SQS → Lambda → processamento automático

---

## 🧠 Conceitos importantes

### Event Source Mapping

Recurso do AWS Lambda que cria uma conexão entre uma fonte de eventos (SQS, Kinesis, DynamoDB Streams) e uma função Lambda. O serviço Lambda faz polling na fila e invoca a função automaticamente quando mensagens estão disponíveis.

### Processamento Assíncrono

Diferente de uma API síncrona (request/response), o processamento via fila é assíncrono — o produtor envia a mensagem e não espera resposta. A Lambda processa no seu próprio ritmo, garantindo desacoplamento.

### Batch Size

Número máximo de mensagens que a Lambda recebe por invocação. Configurado como 1 neste projeto para simplificar o processamento, mas pode ser aumentado para otimizar throughput.

### Tratamento de Falhas

Se a Lambda falhar ao processar uma mensagem (exceção não tratada), a mensagem volta para a fila. Após 3 falhas (definido na Redrive Policy da Fase 4), a mensagem é enviada para a DLQ.

---

## ⚙️ Como funciona

```
Mensagem enviada para SQS
        ↓
Lambda Service faz polling na fila
        ↓
Mensagem disponível detectada
        ↓
Lambda é invocada com o payload da mensagem
        ↓
Processamento executado
        ↓
┌───────┴───────┐
↓               ↓
Sucesso         Falha
(msg deletada)  (msg volta para fila → retry → DLQ)
```

---

## 📁 Arquivos principais

| Arquivo | Função |
|---------|--------|
| `modules/lambda/main.tf` | Event Source Mapping + IAM policies |
| `lambda_src/hello_lambda/app.py` | Código que processa mensagens SQS |

---

## 🔐 Permissões IAM necessárias

```json
{
  "Effect": "Allow",
  "Action": [
    "sqs:ReceiveMessage",
    "sqs:DeleteMessage",
    "sqs:GetQueueAttributes"
  ],
  "Resource": "<SQS_QUEUE_ARN>"
}
```

---

## 📚 Documentação oficial

- https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/lambda_event_source_mapping
- https://docs.aws.amazon.com/lambda/latest/dg/with-sqs.html
- https://docs.aws.amazon.com/lambda/latest/dg/invocation-eventsourcemapping.html

---

## 🧪 Como testar

```bash
# Enviar mensagem para a fila
aws sqs send-message \
  --queue-url <QUEUE_URL> \
  --message-body '{"action": "test", "source": "manual"}'

# Verificar execução da Lambda nos logs
aws logs tail /aws/lambda/Terraform-Serverless-dev-hello-lambda --follow

# Confirmar que a mensagem foi consumida (fila vazia)
aws sqs get-queue-attributes \
  --queue-url <QUEUE_URL> \
  --attribute-names ApproximateNumberOfMessages
```

---

## 📈 Resultado esperado

- Mensagens enviadas para SQS disparam a Lambda automaticamente
- Logs no CloudWatch confirmam o processamento
- Fila fica vazia após processamento bem-sucedido
- Mensagens com falha são redirecionadas para DLQ
- Fluxo event-driven funcional e desacoplado
