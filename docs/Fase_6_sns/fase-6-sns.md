# Fase 6 — SNS (Notificações)

## 🎯 Objetivo

Adicionar notificações ao fluxo de processamento utilizando Amazon SNS, completando o pipeline event-driven: SQS → Lambda → SNS → Email. Isso permite que stakeholders sejam notificados automaticamente sobre eventos do sistema.

---

## 🏗️ O que foi criado

- SNS Topic para distribuição de notificações
- Subscription por email para recebimento de alertas
- Permissão IAM para Lambda publicar no SNS (`sns:Publish`)
- Integração no fluxo: Lambda processa mensagem e notifica via SNS
- Módulo Terraform reutilizável (`modules/sns/`)

---

## 🧠 Conceitos importantes

### Amazon SNS

Simple Notification Service — serviço de mensageria pub/sub gerenciado pela AWS. Permite publicar mensagens em um Topic e distribuí-las para múltiplos subscribers (email, SMS, Lambda, SQS, HTTP).

### Padrão Pub/Sub

Modelo de comunicação onde o publicador (Lambda) envia mensagens para um canal (Topic) sem conhecer os destinatários. Os subscribers se inscrevem no Topic e recebem as mensagens automaticamente.

### SNS Topic

Canal de distribuição de mensagens. Funciona como um ponto central onde mensagens são publicadas e distribuídas para todos os subscribers ativos.

### Subscription

Inscrição de um endpoint (email, Lambda, SQS) em um Topic. Cada subscriber recebe uma cópia de todas as mensagens publicadas no Topic.

### Confirmação de Subscription

Subscriptions por email requerem confirmação manual — a AWS envia um email com link de confirmação que deve ser clicado pelo destinatário.

---

## ⚙️ Como funciona

```
Evento chega na fila SQS
        ↓
Lambda é invocada automaticamente
        ↓
Lambda processa a mensagem
        ↓
Lambda publica notificação no SNS Topic
        ↓
SNS distribui para todos os subscribers
        ↓
Email recebido pelo administrador
```

Fluxo completo até aqui:
```
EventBridge/Manual → SQS → Lambda → SNS → Email
```

---

## 📁 Arquivos principais

| Arquivo | Função |
|---------|--------|
| `modules/sns/main.tf` | Topic + Subscription |
| `modules/sns/variables.tf` | Email de notificação |
| `modules/sns/outputs.tf` | ARN e nome do Topic |
| `lambda_src/hello_lambda/app.py` | Código que publica no SNS |

---

## 🔐 Permissões IAM necessárias

```json
{
  "Effect": "Allow",
  "Action": "sns:Publish",
  "Resource": "<SNS_TOPIC_ARN>"
}
```

---

## 📚 Documentação oficial

- https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/sns_topic
- https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/sns_topic_subscription
- https://docs.aws.amazon.com/sns/latest/dg/welcome.html

---

## 🧪 Como testar

```bash
# Publicar mensagem diretamente no Topic
aws sns publish \
  --topic-arn <TOPIC_ARN> \
  --message "Teste de notificação CloudTrilhas"

# Ou enviar mensagem para SQS e aguardar o fluxo completo
aws sqs send-message \
  --queue-url <QUEUE_URL> \
  --message-body '{"action": "notify", "source": "test"}'
```

Validação:
1. Confirmar subscription no email (primeiro uso)
2. Verificar recebimento do email de notificação
3. Validar logs da Lambda no CloudWatch

---

## 📈 Resultado esperado

- SNS Topic criado e funcional
- Email subscription ativa (após confirmação)
- Lambda publica notificações após processar mensagens
- Administrador recebe emails automáticos sobre eventos
- Pipeline event-driven completo: SQS → Lambda → SNS → Email
