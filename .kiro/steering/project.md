# CloudTrilhas — Project Steering

## Context

CloudTrilhas é uma plataforma educacional serverless de treinamentos em Cloud,
DevOps e Certificações AWS. Site estático (trilhas + materiais em PDF + simulados)
servido por CloudFront/S3, com backend serverless para captura de leads, contador
de visitantes, métricas de download, painel administrativo e autenticação de alunos.

Nasceu como laboratório de Terraform e evoluiu organicamente para uma aplicação
real em produção com domínio próprio, CI/CD e usuários reais.

## Stack (não-negociável)

- **IaC:** Terraform (não SAM, não CDK)
- **Compute:** AWS Lambda (Python) — serverless only
- **API:** API Gateway (HTTP)
- **Database:** Amazon DynamoDB (single-table quando aplicável, PAY_PER_REQUEST)
- **Storage/CDN:** Amazon S3 + CloudFront (OAC)
- **DNS/TLS:** Route 53 + ACM
- **Auth de alunos:** Amazon Cognito (User Pool, login por email)
- **Mensageria/eventos:** EventBridge, SQS (+ DLQ), SNS
- **Observabilidade:** CloudWatch (dashboards + alarmes)
- **CI/CD:** GitHub Actions + OIDC (zero access keys)
- **Frontend:** HTML/CSS/JS puro (sem framework/build) — site estático
- **Região:** us-west-2 (PROD)

## Conta e Recursos

| Item | Valor |
|------|-------|
| GitHub | github.com/rscopim/terraform-serverless |
| Região | us-west-2 |
| Domínio (PROD) | www.cloudtrilhas.com.br |
| CloudFront (PROD) | E16GA24I7417C2 |
| S3 site (PROD) | materiais-e-trilhas-de-estudos |
| State bucket | terraform-serverless-projeto-trilhas |
| API endpoint | eillhz5fkl.execute-api.us-west-2.amazonaws.com |
| Owner | ricardo.simines@gmail.com |

## Convenções

- Código de infra em Terraform, organizado em `modules/` + `environments/{dev,prod,shared}`
- Lambdas em `lambda_src/<nome>/app.py` com módulos Terraform em `modules/<nome>_lambda/`
- Site estático em `static_site/`; trilhas em subpastas (`python/`, `github/`, etc.)
- Texto voltado ao usuário em Português (PT-BR)
- Naming de recursos: `${project_name}-${environment}-<recurso>`
- DynamoDB sempre PAY_PER_REQUEST (sem provisioned)
- Sem credenciais hardcoded — OIDC no CI, IAM roles nas Lambdas
- Commits e PRs em português; PR → plan → merge → apply (nunca apply local)

## Regras de Operação (críticas)

- **Toda mudança de infra passa pelo pipeline:** branch → PR → plan → merge → apply.
  NUNCA rodar `terraform apply` local.
- **CloudFront/bloqueio de bots está CONGELADO** — não alterar (custo estabilizado).
- **Lambda@Edge é proibido** por padrão — cobra por request (inclui bots), risco de custo.
- Pipeline só aplica no merge para a branch `main`.
- `questoes.js` está no `.gitignore` — enviado ao S3 manualmente.

## Controle de Custos

- Custo alvo: ~US$ 5–10/mês (sem Bedrock provisionado).
- Alavancas de custo: CloudFront (transferência), CloudWatch dashboards (~US$3 cada),
  Route 53 (US$0.50/zona). DynamoDB/Lambda/API GW ficam no free tier em tráfego normal.
- Cognito: free tier de 50.000 MAUs/mês.
- Antes de adicionar recurso novo, avaliar impacto de custo e preferir free tier.

## Padrões de Conteúdo (trilhas)

- Módulos seguem estrutura padrão: `header` com nav-actions, `training-hero`,
  `module-progress container` (progress-track), seções alternadas
  `module-section` / `module-section alt-bg`, `learning-section` com nav
  (button secondary + button primary), `footer` padrão.
- CSS em `../style.css`, `../trail-gate.css`, `../linux-training.css` (raiz, sem /css/).
- Scripts em `../trail-gate.js`, `../config.js`, `../app.js` (raiz, sem /js/).
- Conteúdo profundo e didático, com exemplos de código e exercícios.
