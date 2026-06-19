# Visão Geral — Requirements

## Objetivo
Plataforma educacional serverless para trilhas de estudo em Cloud, DevOps e certificações AWS, hospedada na AWS com custo mínimo.

## Requisitos Funcionais
- Servir site estático via CloudFront + S3
- Capturar leads (nome, email) para download de materiais PDF
- Registrar acessos às trilhas com identificação do usuário
- Simulados interativos com banco de questões por certificação
- Dashboard analytics acessível sem login na AWS
- Relatório semanal enviado por email via SNS
- CI/CD automatizado via GitHub Actions + OIDC

## Requisitos Não Funcionais
- Custo mensal < $2 (free tier + serverless)
- Disponibilidade via CloudFront (edge global)
- Zero secrets estáticos (OIDC para CI/CD)
- HTTPS obrigatório (ACM + CloudFront)
- Dados criptografados em repouso (DynamoDB, S3)

## Critérios de Aceitação
- Site acessível em cloudtrilhas.com.br
- Formulário de identificação bloqueia acesso sem preenchimento
- Downloads registrados no DynamoDB com métrica CloudWatch
- Pipeline roda plan em PR e apply em merge na main
- Dashboard funcional em /admin/dashboard.html
