# Fase 1 — Setup do Projeto Serverless

## 🎯 Objetivo

Estruturar a base do projeto Terraform para suportar uma arquitetura serverless completa na AWS, definindo padrões de organização, modularização e configuração que serão utilizados ao longo de todas as fases seguintes.

---

## 🏗️ O que foi criado

- Estrutura de diretórios modular (`environments/`, `modules/`, `lambda_src/`, `static_site/`)
- Configuração do provider AWS com região parametrizada
- Ambiente inicial de desenvolvimento (`environments/dev/`)
- Arquivo de variáveis com valores padrão
- Separação entre infraestrutura e código de aplicação

---

## 🧠 Conceitos importantes

### Provider AWS

O provider é o plugin que permite ao Terraform interagir com a API da AWS. Ele define a região onde os recursos serão criados e as credenciais utilizadas para autenticação.

### Estrutura Modular

A organização em módulos reutilizáveis é uma prática essencial em projetos Terraform de produção. Cada módulo encapsula um conjunto de recursos relacionados (ex: Lambda, SQS, S3), permitindo reutilização entre ambientes e reduzindo duplicação de código.

### Separação de Ambientes

Desde o início, o projeto foi desenhado para suportar múltiplos ambientes (dev, prod, shared). Cada ambiente possui seu próprio diretório com variáveis específicas, permitindo isolamento completo de infraestrutura.

### Terraform Variables

Variáveis permitem parametrizar a infraestrutura sem alterar o código-fonte. Valores como região, nome do projeto e ambiente são definidos em `variables.tf` e sobrescritos em `terraform.tfvars`.

---

## ⚙️ Como funciona

O Terraform foi configurado com o provider AWS apontando para a região `us-west-2`. A estrutura de diretórios segue o padrão recomendado para projetos multi-ambiente:

```
terraform-serverless/
├── environments/
│   └── dev/          ← Configuração do ambiente
├── modules/          ← Módulos reutilizáveis
├── lambda_src/       ← Código das funções Lambda
├── static_site/      ← Arquivos do site estático
└── docs/             ← Documentação por fases
```

Nesta fase nenhum recurso AWS foi criado — o objetivo é exclusivamente preparar a fundação do projeto para crescimento organizado.

---

## 📁 Arquivos principais

| Arquivo | Função |
|---------|--------|
| `environments/dev/main.tf` | Chamada dos módulos |
| `environments/dev/variables.tf` | Declaração de variáveis |
| `environments/dev/terraform.tfvars` | Valores do ambiente dev |
| `environments/dev/providers.tf` | Configuração do provider AWS |

---

## 📚 Documentação oficial

- https://registry.terraform.io/providers/hashicorp/aws/latest/docs
- https://developer.hashicorp.com/terraform/language/modules
- https://developer.hashicorp.com/terraform/language/values/variables

---

## 🧪 Como testar

```bash
cd environments/dev
terraform init       # Inicializa providers e backend
terraform plan       # Deve retornar "No changes" (nenhum recurso declarado)
terraform validate   # Valida sintaxe dos arquivos .tf
```

---

## 📈 Resultado esperado

- Terraform inicializado sem erros
- Nenhum recurso para criação no plan
- Estrutura pronta para receber os módulos das próximas fases
