# Fase 14 — DynamoDB (Banco de Dados de Leads)

## 🎯 Objetivo

Criar uma tabela Amazon DynamoDB para armazenar os leads capturados pelo portal CloudTrilhas, utilizando modelo serverless (pay-per-request) com Point-in-Time Recovery habilitado para proteção contra perda de dados.

---

## 🏗️ O que foi criado

- Tabela DynamoDB com billing mode PAY_PER_REQUEST
- Partition Key: `lead_id` (String)
- Point-in-Time Recovery (PITR) habilitado
- Encryption at rest (padrão AWS)
- Tags de projeto para governança de custos
- Módulo Terraform (`modules/dynamodb/`)

---

## 🧠 Conceitos importantes

### Amazon DynamoDB

Banco de dados NoSQL totalmente gerenciado, com latência de milissegundos em qualquer escala. Ideal para workloads serverless por não requerer provisionamento de capacidade.

### PAY_PER_REQUEST (On-Demand)

Modo de cobrança onde o custo é baseado apenas nas operações realizadas (leituras e escritas). Não há capacidade provisionada — ideal para workloads com tráfego imprevisível ou baixo volume.

Comparação:
| Modo | Quando usar |
|------|-------------|
| PAY_PER_REQUEST | Tráfego variável, projetos iniciais |
| PROVISIONED | Tráfego previsível, alto volume |

### Partition Key (Hash Key)

Chave primária que identifica unicamente cada item na tabela. O DynamoDB usa o hash da partition key para distribuir dados entre partições internas.

### Point-in-Time Recovery (PITR)

Funcionalidade que permite restaurar a tabela para qualquer ponto nos últimos 35 dias. Protege contra exclusões acidentais e corrupção de dados.

### Estrutura do Item

```json
{
  "lead_id": "uuid-v4",
  "name": "Nome do Usuário",
  "email": "email@example.com",
  "material": "docker-do-zero-ao-avancado.pdf",
  "consent": true,
  "created_at": "2026-01-15T10:30:00Z"
}
```

---

## ⚙️ Como funciona

```
Lambda register_lead recebe dados do formulário
        ↓
Gera UUID para lead_id
        ↓
Executa PutItem no DynamoDB
        ↓
Item armazenado com todos os campos
        ↓
PITR mantém histórico de 35 dias
        ↓
Dados disponíveis para consulta e análise
```

---

## 📁 Arquivos principais

| Arquivo | Função |
|---------|--------|
| `modules/dynamodb/main.tf` | Tabela + PITR + Tags |
| `modules/dynamodb/variables.tf` | Nome do projeto, ambiente |
| `modules/dynamodb/outputs.tf` | Table name, ARN |

---

## 📚 Documentação oficial

- https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/dynamodb_table
- https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Introduction.html
- https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/PointInTimeRecovery.html

---

## 🧪 Como testar

```bash
# Listar itens na tabela
aws dynamodb scan \
  --table-name Terraform-Serverless-dev-leads \
  --select COUNT

# Consultar item específico
aws dynamodb get-item \
  --table-name Terraform-Serverless-dev-leads \
  --key '{"lead_id": {"S": "<UUID>"}}'

# Verificar PITR
aws dynamodb describe-continuous-backups \
  --table-name Terraform-Serverless-dev-leads
```

---

## 📈 Resultado esperado

- Tabela criada com billing on-demand (custo zero sem uso)
- Leads registrados com todos os campos necessários
- PITR habilitado para proteção de dados
- Encryption at rest ativa por padrão
- Tabela pronta para escalar automaticamente conforme demanda
