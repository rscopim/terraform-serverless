# Fase 24 — Shared Resources (Introdução)

## 🎯 Objetivo

Centralizar recursos que pertencem à conta AWS (não a um ambiente específico) em um diretório `shared/` com state independente, resolvendo conflitos de duplicação e aplicando o conceito de resource ownership.

---

## 📖 Estrutura da Fase 24

| Sub-fase | Tema | Recurso |
|----------|------|---------|
| **24A** | Conceito de Shared Resources | Estrutura e backend |
| **24B** | GitHub OIDC Shared | OIDC Provider + IAM Role |
| **24C** | Budget Shared | AWS Budget centralizado |
| **24D** | State Import Strategy | Migração sem downtime |

---

## 🧠 O problema

Durante a separação DEV/PROD (Fase 23), alguns recursos causaram conflitos:

```
DEV: terraform apply → Cria OIDC Provider ✅
PROD: terraform apply → EntityAlreadyExists ❌
```

**Causa**: Recursos como OIDC Provider e Budget são globais na conta AWS — só pode existir um de cada, independente do ambiente.

---

## 🏗️ Nova arquitetura

```
terraform-serverless/
├── environments/
│   ├── shared/        ← Recursos da CONTA (1 por conta)
│   │   ├── main.tf
│   │   ├── backend.tf (key: shared/terraform.tfstate)
│   │   └── OIDC, Budget
│   │
│   ├── dev/           ← Recursos do AMBIENTE dev
│   │   └── Lambda, S3, CloudFront, API GW, etc.
│   │
│   └── prod/          ← Recursos do AMBIENTE prod
│       └── Lambda, S3, CloudFront, API GW, etc.
```

---

## 🧠 Conceitos importantes

### Resource Ownership

Nem todo recurso pertence a um ambiente. Classificação:

| Tipo | Pertence a | Exemplos |
|------|-----------|----------|
| Ambiente | DEV ou PROD | S3, Lambda, API GW, DynamoDB |
| Conta | Shared | OIDC Provider, Budget, CloudTrail |

### terraform import

Comando para assumir controle de um recurso AWS já existente sem recriá-lo:
```bash
terraform import <resource_address> <aws_id>
```

### terraform state rm

Remove um recurso do state **sem destruí-lo na AWS**:
```bash
terraform state rm <resource_address>
```

Usado para "mover" recursos entre states (remove do antigo, importa no novo).

---

## ⚙️ Estratégia de migração

```
1. Identificar recurso global (OIDC, Budget)
        ↓
2. Criar código no shared/
        ↓
3. terraform import no shared state
        ↓
4. terraform state rm no dev/prod state
        ↓
5. Recurso agora gerenciado pelo shared
        ↓
6. Zero downtime, zero recriação
```

---

## 📚 Documentação oficial

- https://developer.hashicorp.com/terraform/cli/commands/import
- https://developer.hashicorp.com/terraform/cli/commands/state/rm
- https://developer.hashicorp.com/terraform/language/state

---

## 📈 Resultado final

- 3 states independentes: shared, dev, prod
- Recursos globais centralizados
- Zero conflitos entre ambientes
- Ownership claro de cada recurso
- Governança de infraestrutura madura
- Arquitetura próxima de padrões enterprise
