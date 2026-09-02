<p align="center">
  <img src="static_site/assets/logo/cloudtrilhas-logo.svg" alt="CloudTrilhas" width="200" />
</p>

<h1 align="center">CloudTrilhas — Plataforma Educacional Serverless</h1>

<p align="center">
  <strong>Portal de treinamentos em Cloud, DevOps e Certificações AWS</strong><br/>
  Infraestrutura 100% serverless provisionada com Terraform e CI/CD via GitHub Actions
</p>

<p align="center">
  <a href="https://www.cloudtrilhas.com.br">🌐 Produção</a> •
  <a href="https://www.dev.cloudtrilhas.com.br">🧪 Dev</a> •
  <a href="#arquitetura">📐 Arquitetura</a> •
  <a href="#tecnologias">⚙️ Stack</a>
</p>

---

## 📋 Sobre o Projeto

O **CloudTrilhas** nasceu como um laboratório pessoal para estudar Terraform e serviços AWS. O que começou como exercícios simples de Infrastructure as Code — criar uma Lambda, configurar uma fila SQS — evoluiu organicamente para uma **aplicação real em produção**, com domínio próprio, CI/CD, observabilidade e usuários reais acessando conteúdo.

Essa evolução não foi planejada desde o início. Cada fase do projeto resolveu um problema real: "preciso de HTTPS" levou ao ACM + CloudFront, "preciso saber quem baixou o PDF" levou ao CloudTrail + EventBridge + SNS, "preciso parar de fazer deploy manual" levou ao GitHub Actions + OIDC. O resultado é um projeto que demonstra não apenas conhecimento técnico, mas a capacidade de **evoluir uma arquitetura incrementalmente** — exatamente como acontece em ambientes corporativos.

Hoje o CloudTrilhas é uma plataforma educacional completa com **11 trilhas** de estudo
e materiais em PDF para download, autenticação de alunos e um sandbox de prática,
servindo conteúdo real para estudantes de Cloud e DevOps.

O projeto demonstra na prática:

- Infraestrutura como Código com **Terraform** (múltiplos módulos reutilizáveis)
- Pipeline CI/CD com **GitHub Actions** + OIDC (zero access keys)
- Arquitetura event-driven com **EventBridge**, **SQS** e **SNS**
- Autenticação de alunos com **Amazon Cognito** (login por email)
- Captura de leads e contador de visitantes com **API Gateway** + **Lambda** + **DynamoDB**
- Sandbox Python no navegador com **Pyodide** (WebAssembly, custo zero)
- Monitoramento com **CloudWatch** (dashboards + alarmes)
- Separação de ambientes **DEV / PROD / SHARED**
- Governança e controle de custo com **AWS Budgets** e contenção de bots no **CloudFront**

---

## 🏗️ Arquitetura

<p align="center">
  <img src="diagram/cloudtrilhas_architecture.png" alt="Diagrama de Arquitetura" width="900" />
</p>

### Fluxos Principais

| # | Fluxo | Caminho |
|---|-------|---------|
| 1 | **Conteúdo Estático** | Usuário → Route 53 → CloudFront (TLS + Cache + geo-restrição + bloqueio de bots no edge) → S3 (OAC) |
| 2 | **Autenticação de Alunos** | Login/Cadastro → Amazon Cognito (User Pool) → token → gate libera as trilhas |
| 3 | **Sandbox de Prática** | Navegador → Pyodide (Python em WebAssembly) — 100% client-side, sem backend |
| 4 | **Captura de Leads** | Formulário → API Gateway → Lambda → DynamoDB |
| 5 | **Contador de Visitantes** | Página → API Gateway → Lambda → DynamoDB (atômico) |
| 6 | **Métricas de Download** | CloudFront → S3 → EventBridge → Lambda → CloudWatch metrics |
| 7 | **Eventos Customizados** | EventBridge → SQS (+ DLQ) → Lambda → SNS |
| 8 | **Painel Admin** | Login admin → API Gateway → Lambda → DynamoDB (sessões/usuários) |
| 9 | **Observabilidade** | CloudWatch Alarms → SNS → Email |
| 10 | **CI/CD** | GitHub Actions → OIDC → Terraform Plan/Apply |

> **Nota de arquitetura:** o CloudTrail foi removido do fluxo de downloads (gerava custo
> alto de S3); o monitoramento de acessos passou a usar métricas do CloudFront (custo zero).
> Uma **CloudFront Function** bloqueia bots no edge para conter custo de transferência.

---

## ⚙️ Tecnologias

### Serviços AWS

| Serviço | Função |
|---------|--------|
| **S3** | Hospedagem do site estático (HTML, CSS, JS, PDFs) |
| **CloudFront** | CDN global com OAC, HTTPS, geo-restrição e bloqueio de bots no edge |
| **Route 53** | DNS gerenciado (cloudtrilhas.com.br) |
| **ACM** | Certificado TLS (us-east-1 para CloudFront) |
| **API Gateway** | HTTP API — leads, contador de visitantes, custos, governança, admin |
| **Lambda** | ~10 funções (register_lead, visitor_counter, download_metrics, analytics, costs, governance, admin_login, admin_users, hello_lambda) |
| **DynamoDB** | Tabelas de leads, contador, admin (on-demand / PAY_PER_REQUEST) |
| **Cognito** | Autenticação de alunos (User Pool, login por email) |
| **SQS** | Fila principal + Dead Letter Queue (3 retries) |
| **SNS** | Notificações por email (downloads, alarmes) |
| **EventBridge** | Roteamento de eventos (downloads + custom) |
| **CloudWatch** | Dashboards (downloads + operacional) + alarmes |
| **IAM** | Roles, policies, OIDC para GitHub Actions |
| **AWS Budgets** | Controle de custos (limite $10/mês) |

### DevOps & IaC

| Ferramenta | Uso |
|-----------|-----|
| **Terraform** | Módulos reutilizáveis, remote state (S3) |
| **GitHub Actions** | CI/CD com OIDC (sem access keys) |
| **Python 3.12** | Runtime das Lambda functions |
| **Pyodide** | Sandbox Python no navegador (WASM, custo zero) |
| **Puppeteer** | Geração automatizada de PDFs |

---

## 🏦 Conta AWS

| Item | Valor |
|------|-------|
| GitHub | github.com/rscopim/terraform-serverless |
| Região | us-west-2 |
| Domínio (PROD) | https://www.cloudtrilhas.com.br |
| CloudFront (PROD) | E16GA24I7417C2 |
| S3 site (PROD) | materiais-e-trilhas-de-estudos |
| State bucket | terraform-serverless-projeto-trilhas |
| API endpoint | https://eillhz5fkl.execute-api.us-west-2.amazonaws.com |
| Owner | ricardo.simines@gmail.com |

> Detalhes de deploy, rollback e ativação do Cognito em [`docs/deployment.md`](docs/deployment.md).
> Convenções e regras do projeto em [`.kiro/steering/project.md`](.kiro/steering/project.md).

---

## 📂 Estrutura do Projeto

```
terraform-serverless/
├── .github/workflows/       # Pipeline CI/CD (plan + apply)
├── diagram/                 # Diagrama de arquitetura (Python + Graphviz)
├── docs/                    # Documentação por fases + blueprint
├── environments/
│   ├── dev/                 # Ambiente de desenvolvimento
│   ├── prod/                # Ambiente de produção
│   └── shared/              # Recursos compartilhados (OIDC, Budget)
├── lambda_src/              # Código-fonte das Lambdas (Python 3.12)
│   ├── hello_lambda/        # Consumer SQS → SNS
│   ├── register_lead/       # API → DynamoDB (captura leads)
│   ├── download_metrics/    # EventBridge → CloudWatch metrics
│   ├── analytics/           # Métricas de uso
│   ├── visitor_counter/     # Contador de visitantes
│   ├── costs/               # Consulta de custos AWS
│   ├── governance/          # Governança
│   ├── admin_login/         # Login administrativo
│   └── admin_users/         # Gestão de usuários admin
├── modules/                 # Módulos Terraform reutilizáveis
│   ├── acm/  api_gateway/  budget/  cloudfront/  cloudwatch_dashboard/
│   ├── cloudwatch_operational/  cognito/  download_metrics/  dynamodb/
│   ├── eventbridge/  github_actions_oidc/  lambda/  register_lead_lambda/
│   ├── route53/  s3_static_site/  sns/  sqs/  analytics/  costs/
│   ├── governance/  admin_auth/  visitor_counter_dynamodb/  visitor_counter_lambda/
├── static_site/             # Site estático (HTML/CSS/JS puro)
│   ├── docker/              # trilha Docker
│   ├── terraform/           # trilha Terraform
│   ├── linux/               # trilha Linux
│   ├── python/              # trilha Python (10 módulos)
│   ├── redes/               # trilha Redes (8 módulos)
│   ├── github/              # trilha Git & GitHub (9 módulos)
│   ├── ai-practitioner/     # domínios AWS AI Practitioner
│   ├── developer/           # domínios AWS Developer
│   ├── solutions-architect/ # domínios AWS SA Associate
│   ├── solutions-architect-pro/ # módulos AWS SA Professional
│   ├── cloud-practitioner/  # domínios AWS Cloud Practitioner
│   ├── sandbox.html + sandbox.js  # Sandbox Python (Pyodide, client-side)
│   ├── login.html + cadastro.html # Auth de alunos (Cognito)
│   ├── auth.js + trail-gate.js    # Sessão Cognito + gate das trilhas
│   └── materiais/           # PDFs para download
├── generate-pdf.js          # Script de geração de PDFs (Puppeteer)
└── README.md
```

---

## 🌍 Ambientes

| Ambiente | URL | Propósito |
|----------|-----|-----------|
| **DEV** | https://www.dev.cloudtrilhas.com.br | Testes e validações |
| **PROD** | https://www.cloudtrilhas.com.br | Produção |
| **SHARED** | — | OIDC + Budget (recursos da conta) |

---

## 🔄 CI/CD Pipeline

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  Push Branch │────▶│  Terraform   │────▶│  Pull Request│
│              │     │  Plan        │     │  (Review)    │
└──────────────┘     └──────────────┘     └──────┬───────┘
                                                  │ Merge
                                           ┌──────┴───────┐
                                           │  Terraform   │
                                           │  Apply       │
                                           │  (auto)      │
                                           └──────────────┘
```

- **Autenticação**: OIDC (sem access keys armazenadas)
- **Validação**: `fmt -check` → `init` → `validate` → `plan`
- **Deploy**: `apply -auto-approve` apenas na main
- **Proteção**: Branch protection + required status checks

---

## 🔐 Segurança

- **OIDC** — GitHub Actions autentica via OpenID Connect (zero secrets de longa duração)
- **IAM Least Privilege** — Cada Lambda tem role com permissões mínimas
- **Encryption** — S3 com SSE, DynamoDB com encryption at rest
- **CloudFront OAC** — S3 não é público, acesso apenas via CloudFront
- **HTTPS** — Certificado ACM em todas as rotas
- **PITR** — Point-in-Time Recovery habilitado no DynamoDB

---

## � Conteúdo da Plataforma

| Trilha | Módulos | PDF |
|--------|---------|-----|
| Docker | 7 | ✅ |
| Terraform | 4 | ✅ |
| Linux | 5 | ✅ |
| Python | 10 | ✅ |
| Redes | 8 | ✅ |
| Git & GitHub | 9 | ✅ |
| AWS AI Practitioner | 5 | ✅ |
| AWS Developer | 4 | ✅ |
| AWS SA Associate | 4 | ✅ |
| AWS SA Professional | 7 | ✅ |
| AWS Cloud Practitioner | 4 | ✅ |
| **Total** | **67 módulos** | **PDFs por trilha** |

> Além das trilhas, a plataforma oferece um **Sandbox Python** interativo
> (`sandbox.html`, via Pyodide/WebAssembly) para praticar código no navegador,
> sem instalar nada e sem custo de infraestrutura.

---

## � Custos

Arquitetura otimizada para Free Tier + uso baixo:

| Serviço | Custo/mês |
|---------|-----------|
| Route 53 | ~$0.50 |
| S3 + CloudFront | ~$0.05 (transferência contida com bloqueio de bots no edge) |
| Lambda + API GW + DynamoDB | ~$0.00 (Free Tier) |
| Cognito | ~$0.00 (Free Tier: 50.000 MAUs/mês) |
| CloudWatch (dashboards) | ~$3–6 |
| **Total** | **~$5–10/mês** |

Budget configurado com alerta em **$10/mês**. O **CloudTrail foi removido**
(gerava custo alto de S3) e o **Lambda@Edge é evitado** por padrão (cobra por request).

---

## 🚀 Como Executar

```bash
# Clone o repositório
git clone https://github.com/rscopim/terraform-serverless.git
cd terraform-serverless

# Inicialize o ambiente dev
cd environments/dev
terraform init
terraform plan
terraform apply

# Gerar PDFs (requer Node.js + Puppeteer)
cd ../..
npm install
node generate-pdf.js docker
node generate-pdf.js terraform
# ... etc
```

---

## 📚 Documentação

O CloudTrilhas possui dois conjuntos de documentação complementares.

### Engineering Blueprint

Documentação estratégica da plataforma.

Define a visão do projeto, princípios de engenharia, arquitetura, padrões de desenvolvimento e roadmap de evolução.

📁 Localização:

```text
docs/blueprint/
```

---

### Documentação por Fases

Documentação técnica de cada evolução implementada na plataforma.

Cada fase registra objetivos, arquitetura, implementação, testes, resultados e decisões técnicas adotadas durante o desenvolvimento.

| Fase | Tema |
|-------|------|
| 1–7 | Fundamentos (Lambda, SQS, SNS, EventBridge) |
| 8–11 | Site Estático (S3, CloudWatch, Métricas) |
| 12–14 | API Gateway, Lambda Leads, DynamoDB |
| 15–18 | Route 53, ACM, CloudFront, OAC + Geo-restrição |
| 19–21 | Well-Architected, Budget, Observabilidade |
| 22–24 | CI/CD, DEV/PROD, Shared Resources |
| 25 | Otimização de Custos |
| 26 | Visitor Counter (Operations Center) |
| 27 | FinOps / Contenção de Custos |
| 28 | Governança |
| 29 | Autenticação (Admin + Alunos via Cognito) |

---

## 👨‍💻 Autor

**Ricardo Simines Scopim**

- AWS Solutions Architect Associate
- AWS Cloud Practitioner
- AWS AI Practitioner
- Instrutor AWS re/Start

[![LinkedIn](https://img.shields.io/badge/LinkedIn-0077B5?style=flat&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/ricardosiminesscopim/)
[![GitHub](https://img.shields.io/badge/GitHub-100000?style=flat&logo=github&logoColor=white)](https://github.com/rscopim)

---

## 📄 Licença

MIT License — veja [LICENSE](LICENSE) para detalhes.
