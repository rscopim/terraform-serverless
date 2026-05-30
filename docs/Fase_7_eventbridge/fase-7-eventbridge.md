# Fase 7 — EventBridge (Arquitetura Orientada a Eventos)

## 🎯 Objetivo

Implementar roteamento inteligente de eventos utilizando Amazon EventBridge, criando uma arquitetura event-driven onde eventos customizados são filtrados e direcionados automaticamente para os destinos corretos (SQS, SNS, Lambda).

---

## 🏗️ O que foi criado

- EventBridge Rule com event pattern customizado
- Target apontando para fila SQS
- Target apontando para SNS Topic
- Target apontando para Lambda de métricas
- Permissões para EventBridge enviar mensagens aos targets
- Módulo Terraform reutilizável (`modules/eventbridge/`)

---

## 🧠 Conceitos importantes

### Amazon EventBridge

Barramento de eventos serverless que permite conectar aplicações usando dados de eventos. Funciona como um roteador central — recebe eventos de diversas fontes e os direciona para targets com base em regras de filtragem.

### Event Pattern

Filtro JSON que define quais eventos uma Rule deve capturar. Permite filtrar por source, detail-type, campos específicos do payload e até prefixos de valores.

### Rule

Regra que associa um event pattern a um ou mais targets. Quando um evento corresponde ao pattern, todos os targets configurados são acionados.

### Target

Destino de um evento capturado por uma Rule. Pode ser Lambda, SQS, SNS, Step Functions, entre outros. Uma Rule pode ter múltiplos targets.

### Event Bus

Barramento onde os eventos trafegam. O EventBridge possui um bus padrão (`default`) e permite criar buses customizados para isolamento.

---

## ⚙️ Como funciona

```
Evento gerado (CloudTrail, aplicação, manual)
        ↓
EventBridge Default Bus
        ↓
Rule avalia Event Pattern
        ↓
Match encontrado
        ↓
┌───────┼───────────────┐
↓       ↓               ↓
SQS    SNS           Lambda
(fila) (notificação) (métricas)
```

Neste projeto, o EventBridge é utilizado para:
1. **Eventos de download**: CloudTrail detecta `GetObject` no S3 → EventBridge roteia para SNS (notificação) e Lambda (métricas)
2. **Eventos customizados**: Aplicação envia eventos → EventBridge roteia para SQS → Lambda processa

---

## 📁 Arquivos principais

| Arquivo | Função |
|---------|--------|
| `modules/eventbridge/main.tf` | Rules + Targets + Permissions |
| `modules/eventbridge/variables.tf` | ARNs dos targets |
| `modules/eventbridge/outputs.tf` | ARN das rules |

---

## 📚 Documentação oficial

- https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/cloudwatch_event_rule
- https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/cloudwatch_event_target
- https://docs.aws.amazon.com/eventbridge/latest/userguide/eb-what-is.html
- https://docs.aws.amazon.com/eventbridge/latest/userguide/eb-event-patterns.html

---

## 🧪 Como testar

```bash
# Enviar evento customizado para o EventBridge
aws events put-events --entries '[
  {
    "Source": "cloudtrilhas.app",
    "DetailType": "CustomEvent",
    "Detail": "{\"action\": \"test\", \"user\": \"admin\"}"
  }
]'

# Verificar processamento
# 1. Mensagem na fila SQS
# 2. Email via SNS
# 3. Logs da Lambda no CloudWatch
```

---

## 📈 Resultado esperado

- Eventos customizados são roteados corretamente para SQS
- Eventos de download (S3 GetObject) disparam notificação SNS e métricas Lambda
- Arquitetura completamente desacoplada — produtores não conhecem consumidores
- Base para observabilidade avançada nas próximas fases
