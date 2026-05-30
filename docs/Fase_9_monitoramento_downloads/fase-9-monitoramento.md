# Fase 9 — Monitoramento de Downloads com CloudTrail + EventBridge

## 🎯 Objetivo

Implementar monitoramento automático de downloads de PDFs no portal CloudTrilhas, utilizando CloudTrail para capturar eventos de acesso ao S3 e EventBridge para rotear notificações em tempo real.

---

## 🏗️ O que foi criado

- CloudTrail Trail com Data Events habilitados para S3
- Bucket S3 dedicado para armazenamento dos logs do CloudTrail
- EventBridge Rule com filtro por `GetObject` no prefixo `materiais/`
- Target SNS para notificação por email
- Target Lambda para registro de métricas
- Módulo Terraform (`modules/cloudtrail/`)

---

## 🧠 Conceitos importantes

### CloudTrail

Serviço de auditoria da AWS que registra todas as chamadas de API realizadas na conta. Existem dois tipos de eventos:

- **Management Events**: Operações de gerenciamento (criar bucket, alterar policy)
- **Data Events**: Operações em dados (GetObject, PutObject no S3)

### Data Events para S3

Por padrão, o CloudTrail não registra acessos a objetos no S3. É necessário habilitar Data Events explicitamente, filtrando por bucket e prefixo para controlar custos.

### Event Pattern (EventBridge)

Filtro que captura apenas eventos relevantes:
```json
{
  "source": ["aws.s3"],
  "detail-type": ["AWS API Call via CloudTrail"],
  "detail": {
    "eventName": ["GetObject"],
    "requestParameters": {
      "bucketName": ["materiais-e-trilhas-dev"],
      "key": [{"prefix": "materiais/"}]
    }
  }
}
```

### Fluxo de Notificação

Quando um usuário baixa um PDF, o administrador recebe um email automático com detalhes do download (arquivo, horário, IP de origem).

---

## ⚙️ Como funciona

```
Usuário acessa PDF via CloudFront
        ↓
CloudFront busca objeto no S3
        ↓
S3 GetObject é executado
        ↓
CloudTrail registra o Data Event
        ↓
EventBridge captura o evento (filtro por materiais/)
        ↓
┌───────┴───────┐
↓               ↓
SNS           Lambda
(email)       (métricas CloudWatch)
```

---

## 📁 Arquivos principais

| Arquivo | Função |
|---------|--------|
| `modules/cloudtrail/main.tf` | Trail + Bucket de logs + Data Events |
| `modules/eventbridge/main.tf` | Rule de download + Targets |

---

## 📚 Documentação oficial

- https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/cloudtrail
- https://docs.aws.amazon.com/awscloudtrail/latest/userguide/logging-data-events-with-cloudtrail.html
- https://docs.aws.amazon.com/eventbridge/latest/userguide/eb-service-event.html

---

## 🧪 Como testar

1. Acessar o portal: `https://www.dev.cloudtrilhas.com.br`
2. Preencher formulário de download de qualquer curso
3. Aguardar 2-5 minutos (latência do CloudTrail)
4. Verificar recebimento de email via SNS
5. Verificar métricas no CloudWatch

---

## 📈 Resultado esperado

- Cada download de PDF gera um evento rastreável
- Administrador recebe notificação por email
- Métricas de download são registradas no CloudWatch
- Auditoria completa de acessos aos materiais
- Base para dashboard de analytics (próximas fases)
