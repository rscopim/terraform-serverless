# Fase 24 — Shared Resources

## Objetivo

Nesta fase o projeto CloudTrilhas evoluiu para um modelo mais próximo de arquiteturas corporativas, separando recursos compartilhados da conta AWS dos ambientes DEV e PROD.

---

# Problema identificado

Durante a separação dos ambientes DEV e PROD foram encontrados recursos globais da conta AWS sendo criados em múltiplos ambientes.

Exemplos:
```text
GitHub OIDC

Budget
CloudTrail
```

Problemas causados:
```text
EntityAlreadyExists
DuplicateRecordException
Conflito entre ambientes
State inconsistente
```

---

# Nova arquitetura

```text
terraform-serverless/
environments/
├── shared/
│   Recursos globais AWS
│
├── dev/
│   Ambiente desenvolvimento
│
└── prod/
    Ambiente produção
```

---

# Recursos Shared

Nesta fase foram movidos:
```text
GitHub Actions OIDC
AWS Budget
```

---

# Objetivos alcançados

```text
✅ Recursos compartilhados centralizados
✅ State separado
✅ DEV independente
✅ PROD independente
✅ Sem destroy em produção
✅ Terraform state consistente
✅ Arquitetura mais próxima mercado
```

---

# Conceito principal

Nem todo recurso pertence ao ambiente.
Alguns pertencem:
```text
Conta AWS
```

Exemplo:
```text
OIDC GitHub
↓
1 por conta AWS
```

---

# Resultado final

CloudTrilhas agora possui:
```text
DEV
PROD
SHARED
```

Separados corretamente.