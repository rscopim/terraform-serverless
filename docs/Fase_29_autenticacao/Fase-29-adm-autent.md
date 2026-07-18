# Fase 29 - Administração e Autenticação

## Objetivo

Implementar uma camada completa de autenticação administrativa para o CloudTrilhas, eliminando a autenticação baseada em senha fixa no frontend e substituindo-a por um backend seguro, escalável e alinhado às boas práticas de desenvolvimento e aos pilares do AWS Well-Architected Framework.

---

# Escopo da Fase

Durante esta fase foram implementados:

- Autenticação administrativa
- Gerenciamento de usuários
- Controle de sessões
- Controle de permissões por perfil
- Integração do Dashboard
- Refatoração do Dashboard
- Melhorias de segurança
- Melhorias no processo de deploy

---

# Arquitetura

```
Administrador
        │
        ▼
Dashboard
        │
        ▼
API Gateway
        │
        ▼
Admin Login Lambda
        │
        ▼
DynamoDB Users
        │
        ▼
Admin Users Lambda
        │
        ▼
DynamoDB Sessions
```

---

# Infraestrutura criada

## DynamoDB

### Admin Users

Responsável pelo armazenamento dos usuários administrativos.
Principais atributos:
- username (PK)
- password_hash
- password_salt
- password_iterations
- role
- status
- name
- email
- created_at
- created_by
- last_login
- password_changed_at

Billing Mode:
- PAY_PER_REQUEST

---

### Admin Sessions

Responsável pelo armazenamento das sessões autenticadas.
Principais atributos:
- token_hash (PK)
- session_id
- username
- created_at
- last_activity
- expires_at
- absolute_expires_at
- source_ip
- user_agent

TTL habilitado utilizando:

```
expires_at
```

---

# Lambdas

## Admin Login

Responsabilidades:
- autenticar usuário
- validar senha
- criar sessão
- registrar último login
- realizar logout

Rotas:
```
POST /auth/login

POST /auth/logout
```

---

## Admin Users

Responsabilidades:
- listar usuários
- criar usuários
- alterar perfil
- alterar senha
- alterar status

Rotas:

```
GET /auth/users
POST /auth/users
PATCH /auth/users/{username}
```

---

# Dashboard

O Dashboard deixou de utilizar autenticação local.
Foi removido:
- senha fixa
- hash local
- localStorage
- autenticação JavaScript

Foi implementado:
- login por usuário
- senha
- Bearer Token
- Logout
- sessão persistida
- controle por perfil

---

# Controle de Perfis

Perfis implementados

## ADMIN

Permissões:
- Dashboard
- Analytics
- Governança
- Custos
- Administração de usuários

---

## EDITOR

Permissões:
- Dashboard
- Analytics
- Governança
- Custos

Sem acesso à administração de usuários.

---

## VIEWER

Permissões:
- Dashboard
- Analytics
- Governança
- Custos

Sem acesso à administração de usuários.

---

# Segurança

Foram implementadas as seguintes medidas:

## Senhas

PBKDF2-HMAC-SHA256
Salt individual
210.000 iterações

---

## Sessões

Token aleatório
48 bytes
Armazenamento somente do hash SHA-256 do token.

---

## Logout

Remoção da sessão no DynamoDB.

---

## Expiração

Tempo de inatividade:
30 minutos
Tempo máximo:
8 horas

---

## HTTP

Separação correta entre:
401 Unauthorized
Sessão inexistente ou expirada.
403 Forbidden
Usuário autenticado sem permissão.

---

## Cache

Cache-Control
Pragma
No Store
Aplicados nas respostas administrativas.

---

# Melhorias no Dashboard

Refatoração completa.
Separação em:

```
dashboard.html
dashboard.css
dashboard.js
```

Benefícios:
- melhor organização
- manutenção simplificada
- reutilização
- menor acoplamento

---

# Deploy

Correções realizadas:
Publicação automática de:

```
dashboard.html
dashboard.css
dashboard.js
```

no bucket S3.
Correção do processo de deploy do CloudFront.

---

# Fluxo de autenticação

```
Usuário
↓
POST /auth/login
↓
Validação da senha
↓
Criação da sessão
↓
Token
↓
Dashboard
↓
Bearer Token
↓
APIs Administrativas
```

---

# Fluxo de Logout

```
Usuário
↓
POST /auth/logout
↓
Sessão removida
↓
Token inválido
↓
Novo login obrigatório
```

---

# Custos

Serviços utilizados:
Lambda
DynamoDB PAY_PER_REQUEST
API Gateway HTTP API
CloudWatch
Os custos esperados permanecem extremamente baixos, compatíveis com o objetivo FinOps do projeto.

---

# AWS Well-Architected Framework

## Operational Excellence

✔ Infraestrutura como Código
✔ CI/CD
✔ Deploy automatizado
✔ Padronização

---

## Security

✔ Hash de senha
✔ Hash de Token
✔ Sessões
✔ IAM
✔ Controle por perfil
✔ Logout

---

## Reliability

✔ DynamoDB
✔ Sessões persistidas
✔ TTL
✔ Controle de expiração

---

## Performance Efficiency

✔ Lambda
✔ HTTP API
✔ DynamoDB On Demand

---

## Cost Optimization

✔ PAY_PER_REQUEST
✔ Serverless
✔ Sem recursos ociosos

---

## Sustainability

✔ Arquitetura Serverless
✔ Recursos sob demanda
✔ Consumo mínimo de infraestrutura

---

# Lições aprendidas

Durante a implementação foram identificados e corrigidos:

- autenticação baseada em senha fixa
- publicação incompleta dos arquivos do Dashboard
- controle inadequado entre 401 e 403
- separação incorreta entre autenticação e autorização
- melhorias no processo de Git utilizando Rebase
- melhorias na publicação do CloudFront

---

# Resultado Final

Ao término da Fase 29 o CloudTrilhas passou a possuir uma camada administrativa completa, segura e preparada para evolução futura.

A plataforma deixou de utilizar autenticação local em JavaScript e passou a utilizar autenticação centralizada em backend, com gerenciamento de usuários, controle de sessões, perfis de acesso e integração completa com o Dashboard Administrativo.

Esta fase estabelece a base para todas as futuras funcionalidades administrativas da plataforma.