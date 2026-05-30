# Fase 4 — SQS (Fila de Mensagens)

## 🎯 Objetivo

Criar uma fila de mensagens com Amazon SQS para desacoplar componentes da arquitetura, implementando processamento assíncrono com tratamento de falhas via Dead Letter Queue (DLQ).

---

## 🏗️ O que foi criado

- Fila principal SQS (Standard Queue)
- Dead Letter Queue (DLQ) para mensagens com falha
- Redrive Policy com limite de 3 tentativas
- Módulo Terraform reutilizável (`modules/sqs/`)
- Outputs com ARN e nome da fila

---

## 🧠 Conceitos importantes

### Amazon SQS

Simple Queue Service — serviço de filas gerenciado pela AWS que permite desacoplamento entre produtores e consumidores de mensagens. Garante entrega at-least-once e escalabilidade automática.

### Standard Queue vs FIFO

- **Standard**: Alta throughput, entrega at-least-once, ordenação best-effort
- **FIFO**: Ordenação garantida, entrega exactly-once, throughput limitado

Neste projeto utilizamos Standard Queue pela simplicidade e performance.

### Dead Letter Queue (DLQ)

Fila secundária que recebe mensagens que falharam no processamento após um número definido de tentativas. Permite análise posterior de falhas sem perder mensagens.

### Redrive Policy

Configuração que define:
- **maxReceiveCount**: Número máximo de tentativas antes de enviar para DLQ (configurado como 3)
- **deadLetterTargetArn**: ARN da fila DLQ destino

### Visibility Timeout

Período em que uma mensagem fica invisível para outros consumidores após ser lida. Se o consumidor não deletar a mensagem nesse período, ela volta a ficar disponível.

---

## ⚙️ Como funciona

```
Produtor envia mensagem → Fila Principal (SQS)
                                  ↓
                          Consumidor processa
                                  ↓
                    ┌─────────────┴─────────────┐
                    ↓                           ↓
              Sucesso                      Falha (retry)
              (mensagem deletada)               ↓
                                    3 falhas consecutivas
                                          ↓
                                    Dead Letter Queue
                                    (análise posterior)
```

---

## 📁 Arquivos principais

| Arquivo | Função |
|---------|--------|
| `modules/sqs/main.tf` | Fila principal + DLQ + Redrive Policy |
| `modules/sqs/variables.tf` | Variáveis do módulo |
| `modules/sqs/outputs.tf` | ARN e nome das filas |

---

## 📚 Documentação oficial

- https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/sqs_queue
- https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/welcome.html
- https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/sqs-dead-letter-queues.html

---

## 🧪 Como testar

```bash
# Enviar mensagem para a fila
aws sqs send-message \
  --queue-url <QUEUE_URL> \
  --message-body '{"evento": "teste", "timestamp": "2026-01-01T00:00:00Z"}'

# Ler mensagem da fila
aws sqs receive-message \
  --queue-url <QUEUE_URL>

# Verificar DLQ (deve estar vazia se não houve falhas)
aws sqs get-queue-attributes \
  --queue-url <DLQ_URL> \
  --attribute-names ApproximateNumberOfMessages
```

---

## 📈 Resultado esperado

- Fila principal criada e funcional
- DLQ configurada como destino de falhas
- Mensagens processadas com sucesso são removidas da fila
- Mensagens com falha são redirecionadas para DLQ após 3 tentativas
- Infraestrutura pronta para integração com Lambda (próxima fase)
