# Fase 22 — Introdução ao CI/CD com GitHub Actions

## 🎯 Objetivo

Explicar de forma simples como o GitHub Actions foi utilizado no projeto CloudTrilhas para automatizar validações e implantações da infraestrutura Terraform na AWS.
Esta fase marca a evolução do projeto de uma execução manual para um fluxo mais próximo de ambientes corporativos reais.

---

## 🧠 O que é GitHub Actions?

GitHub Actions é uma ferramenta de automação integrada ao GitHub.
Com ela, é possível executar tarefas automaticamente quando algo acontece no repositório.
Exemplo:
```text
git push
```

Pode disparar automaticamente:
```text
terraform fmt
terraform validate
terraform plan
terraform apply
```

---

## 🧠 O que é CI/CD?

### CI — Continuous Integration

CI significa Integração Contínua.
No contexto deste projeto, significa validar automaticamente o código Terraform sempre que uma alteração for enviada para o GitHub.
Exemplo:
```text
Alteração no VSCode
↓
git push
↓
GitHub Actions executa validações
```

Validações executadas:
* terraform fmt
* terraform init
* terraform validate
* terraform plan

---

### CD — Continuous Delivery / Continuous Deployment

CD está relacionado à entrega ou implantação automática.
No CloudTrilhas, usamos um modelo seguro:
```text
Terraform Plan
↓
Aprovação manual
↓
Terraform Apply
```

Ou seja, o GitHub prepara a alteração, mas a implantação só acontece após aprovação.

---

## 🧠 O que é Workflow?

Workflow é o arquivo de automação do GitHub Actions.
Ele fica dentro da pasta:
```text
.github/workflows/
```

Neste projeto foi criado:

```text
.github/workflows/terraform-ci.yml
```

Esse arquivo define:
* quando a pipeline roda
* quais comandos serão executados
* qual versão do Terraform será usada
* como o GitHub vai se conectar à AWS

---

## 🧠 O que é Runner?

Runner é a máquina temporária que executa os comandos da pipeline.
No projeto foi usado:
```text
ubuntu-latest
```

Isso significa que o GitHub cria uma máquina Linux temporária para executar:
```text
terraform init
terraform validate
terraform plan
terraform apply
```

Depois da execução, essa máquina é descartada.

---

## 🧠 O que é OIDC?

OIDC significa OpenID Connect.
Ele permite que o GitHub Actions se conecte à AWS sem usar Access Key e Secret Key.
Modelo antigo:
```text
GitHub Secrets
↓
AWS_ACCESS_KEY_ID
AWS_SECRET_ACCESS_KEY
↓
AWS
```

Modelo moderno usado no CloudTrilhas:
```text
GitHub Actions
↓
OIDC Provider
↓
IAM Role temporária
↓
AWS STS
↓
Credenciais temporárias
↓
Terraform
```

Esse modelo é mais seguro porque não utiliza credenciais permanentes no GitHub. A action oficial `configure-aws-credentials` recomenda o uso de OIDC para autenticação com AWS, criando uma relação de confiança entre o GitHub e uma IAM Role. :contentReference[oaicite:0]{index=0}

---

## 🧠 O que é IAM Role temporária?

É uma função IAM que o GitHub Actions assume temporariamente durante a execução da pipeline.
No projeto foi criada a role:
```text
Terraform-Serverless-dev-github-actions-role
```

Ela permite que o GitHub execute ações na AWS durante o workflow.
Fluxo:
```text
GitHub Actions
↓
Assume Role
↓
Recebe credenciais temporárias
↓
Executa Terraform
```

---

## 🧠 O que é Trust Policy?

Trust Policy é a política que define quem pode assumir uma IAM Role.
No CloudTrilhas, a trust policy permite que somente o repositório autorizado assuma a role.
Exemplo conceitual:
```text
repo:rscopim/terraform-serverless
```

Isso evita que outros repositórios usem a role indevidamente.

---

## 🧠 O que é Environment no GitHub?

Environment é uma camada de proteção dentro do GitHub Actions.
No projeto foi criado o environment:
```text
production
```

Ele foi usado para exigir aprovação manual antes do `terraform apply`.
Fluxo:
```text
Terraform Plan
↓
Aguardando aprovação
↓
Approve and Deploy
↓
Terraform Apply
```

---

## 🧠 O que é Terraform State?

Terraform State é o arquivo que guarda o estado atual da infraestrutura.
Ele registra o que o Terraform criou na AWS.
Exemplo:
```text
CloudFront
S3
Lambda
DynamoDB
API Gateway
Route53
```

Sem o state, o Terraform não sabe o que já existe.

---

## 🧠 Por que precisamos de Remote State?

Inicialmente o Terraform usava state local na máquina.
Problema:
```text
Seu computador tinha o state
GitHub Actions não tinha
```

Resultado:
```text
GitHub Actions tentou recriar toda a infraestrutura
```

Correção:
```text
Terraform Remote State com S3
```

Agora:
```text
Seu computador
↓
S3 Backend

GitHub Actions
↓
S3 Backend
```

Ambos usam o mesmo state.
O backend S3 é usado pelo Terraform para armazenar o state remotamente, e versões atuais também suportam locking nativo com `use_lockfile`. :contentReference[oaicite:1]{index=1}

---

## 🏗️ Arquitetura do CI/CD

Fluxo implementado:
```text
VSCode
↓
git add
↓
git commit
↓
git push
↓
GitHub Actions
↓
Terraform Format
↓
Terraform Init
↓
Terraform Validate
↓
Terraform Plan
↓
Aprovação Manual
↓
Terraform Apply
↓
AWS
```

---

## ⚙️ Arquivos criados

### Workflow GitHub Actions

```text
.github/workflows/terraform-ci.yml
```

Responsável por executar:
* Checkout do código
* Configuração AWS via OIDC
* Instalação Terraform
* Terraform fmt
* Terraform init
* Terraform validate
* Terraform plan
* Terraform apply com aprovação manual

---

### Módulo OIDC

```text
modules/github_actions_oidc/
```

Responsável por criar:
* OIDC Provider
* IAM Role
* Trust Policy
* Permissões para pipeline

---

### Backend remoto

```text
environments/dev/backend.tf
```

Responsável por configurar:
* Bucket S3 do Terraform State
* Caminho do state
* Criptografia
* Lock remoto

---

## 🧪 Erros encontrados e correções

### Erro 1 — GitHub tentou recriar toda a infraestrutura

Causa:
```text
State local
```

GitHub Actions não tinha acesso ao state usado localmente.
Correção:
```text
Criado backend remoto S3
```

---

### Erro 2 — OIDC não conseguia assumir a role

Erro:
```text
Not authorized to perform sts:AssumeRoleWithWebIdentity
```

Causa:
O token OIDC mudou quando o job passou a usar environment `production`.
Correção:

Adicionar na trust policy:
```text
repo:rscopim/terraform-serverless:environment:production
```

---

### Erro 3 — Versões diferentes do Terraform

Causa:
O `plan` foi criado com uma versão e o `apply` tentou usar outra.
Correção:

Padronizar a versão nos dois jobs:
```text
Terraform 1.10.5
```

---

### Erro 4 — Arquivos ZIP das Lambdas não encontrados

Causa:
Os arquivos `.zip` existiam localmente, mas não existiam no runner do GitHub.

Correção:
Gerar os pacotes dentro do workflow:

```text
hello_lambda.zip
register_lead.zip
download_metrics.zip
```

---

### Erro 5 — Nome incorreto de pasta Lambda

Causa:
Pipeline usava:
```text
register_lead_lambda
```

Mas o diretório real era:
```text
register_lead
```

Correção:
Ajustar caminho no workflow.

---

## 🔐 Segurança aplicada

* Sem Access Key
* Sem Secret Key
* Uso de OIDC
* IAM Role temporária
* Environment com aprovação manual
* Terraform Apply protegido
* Remote State centralizado
* Pipeline auditável

---

## 📈 Resultado esperado

Ao final da Fase 22, o CloudTrilhas passa a ter:
* Pipeline CI/CD funcional
* Validação automática Terraform
* Integração segura GitHub + AWS
* Apply manual aprovado
* Remote State no S3
* Auditoria de execução pelo GitHub
* Base para ambientes DEV e PROD

---

## 🚀 Próximas melhorias

* Remover AdministratorAccess temporário
* Criar policy mínima para pipeline
* Implementar Branch Protection
* Separar ambientes DEV e PROD
* Gerar pacotes Lambda via Terraform `archive_file`
* Melhorar auditoria do Terraform Plan