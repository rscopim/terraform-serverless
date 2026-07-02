# 03 - Arquitetura da Plataforma

> **Documento:** Engineering Blueprint  
> **Versão:** 2.0  
> **Status:** Em evolução  
> **Última atualização:** Julho/2026

---

# Objetivo

Este documento apresenta a arquitetura oficial do CloudTrilhas.

Seu objetivo é documentar a organização da plataforma, os principais componentes, o fluxo de comunicação entre eles e os princípios arquiteturais que orientam sua evolução.

A arquitetura foi projetada para priorizar simplicidade, baixo custo operacional, escalabilidade, segurança, observabilidade e facilidade de manutenção.

Este documento representa a referência oficial para qualquer evolução arquitetural futura.

---

# Sumário

- Visão Geral
- Objetivos Arquiteturais
- Arquitetura Atual
- Camadas da Plataforma
- Componentes da Plataforma
- Fluxo Geral de Requisições
- Fluxo Administrativo
- Arquitetura Serverless
- Princípios Arquiteturais
- Escalabilidade
- Evolução da Arquitetura
- Considerações Finais
- Próximo Documento

---

# Visão Geral

O CloudTrilhas foi projetado utilizando uma arquitetura serverless baseada em serviços gerenciados da AWS.

A plataforma possui dois grandes ambientes funcionais.

- Plataforma Pública
- Operations Center

Ambos compartilham parte da infraestrutura, porém possuem responsabilidades distintas.

Essa separação permite evoluir funcionalidades administrativas sem impactar a experiência dos usuários da plataforma.

---

# Objetivos Arquiteturais

A arquitetura foi construída para atender os seguintes objetivos.

- Alta disponibilidade.
- Baixo custo operacional.
- Escalabilidade automática.
- Segurança por padrão.
- Facilidade de manutenção.
- Infraestrutura reproduzível.
- Observabilidade integrada.
- Evolução incremental.

Cada decisão arquitetural tomada no CloudTrilhas deve contribuir para um ou mais desses objetivos.

---

# Arquitetura Atual

A arquitetura atual da plataforma pode ser representada da seguinte forma.

```text
                                   Usuário
                                      │
                                      ▼
                               Amazon CloudFront
                                      │
                                      ▼
                                Amazon S3
                                      │
              ┌───────────────────────┴────────────────────────┐
              │                                                │
              ▼                                                ▼
      Portal Público                                 Dashboard Administrativo
              │                                                │
              └───────────────────────┬────────────────────────┘
                                      │
                                      ▼
                               Amazon API Gateway
                                      │
          ┌───────────────────────────┼────────────────────────────┐
          │                           │                            │
          ▼                           ▼                            ▼
   Register Lead              Analytics API               Visitor Counter API
          │                           │                            │
          └───────────────────────────┼────────────────────────────┘
                                      ▼
                               AWS Lambda
                                      │
             ┌────────────────────────┼────────────────────────┐
             │                        │                        │
             ▼                        ▼                        ▼
        DynamoDB                CloudWatch               Amazon SNS
                                      │
                                      ▼
                                 EventBridge
```

Esta arquitetura foi construída para reduzir dependências entre componentes e facilitar a evolução futura da plataforma.

---

# Camadas da Plataforma

A arquitetura está organizada em cinco camadas.

## Camada de Apresentação

Responsável pela interface utilizada pelos usuários.

Inclui:

- Portal Público.
- Dashboard Administrativo.
- Páginas das trilhas.
- Materiais.
- Simulados.

---

## Camada de Distribuição

Responsável pela entrega do conteúdo.

Inclui:

- CloudFront.
- HTTPS.
- Cache.
- Distribuição global.

Essa camada otimiza desempenho e reduz latência.

---

## Camada de Aplicação

Responsável pelas regras de negócio.

Inclui:

- API Gateway.
- AWS Lambda.
- Processamento das requisições.
- Integrações.

Toda lógica da plataforma está concentrada nesta camada.

---

## Camada de Dados

Responsável pelo armazenamento das informações.

Inclui:

- DynamoDB.
- Métricas.
- Logs.
- Dados administrativos.

---

## Camada Operacional

Responsável pelo gerenciamento da plataforma.

Inclui:

- Terraform.
- GitHub Actions.
- Observabilidade.
- FinOps.
- Dashboard.
- Monitoramento.

---

# Componentes da Plataforma

## Portal Público

Disponibiliza conteúdos educacionais aos usuários.

Responsabilidades:

- Exibir trilhas.
- Disponibilizar materiais.
- Exibir simulados.
- Capturar leads.
- Redirecionar usuários.

---

## Operations Center

Área administrativa da plataforma.

Responsável por:

- Analytics.
- Visitor Counter.
- Indicadores.
- FinOps.
- Observabilidade.
- Monitoramento.
- Saúde da plataforma.

Seu objetivo é reduzir a dependência da Console AWS para atividades operacionais.

---

## API Gateway

Representa o ponto único de entrada das APIs da plataforma.

Responsabilidades.

- Receber requisições.
- Encaminhar chamadas.
- Integrar Lambdas.
- Padronizar acesso aos serviços.

---

## AWS Lambda

Executa toda lógica de negócio da aplicação.

Cada Lambda possui responsabilidade única.

Exemplos.

- Registro de Leads.
- Analytics.
- Visitor Counter.
- Processamentos futuros.

---

## DynamoDB

Responsável pelo armazenamento persistente da plataforma.

Atualmente armazena informações relacionadas aos usuários, analytics e demais funcionalidades administrativas.

Sua utilização privilegia simplicidade operacional e escalabilidade automática.

---

## CloudFront

Responsável pela distribuição global do conteúdo.

Além do desempenho, desempenha papel importante na proteção da plataforma contra tráfego indevido e otimização de custos.

Todas as evoluções deverão preservar as estratégias atuais de segurança e cache.

---

## CloudWatch

Responsável pela observabilidade da plataforma.

Concentra:

- Logs.
- Métricas.
- Alarmes.
- Dashboards.

Toda nova funcionalidade deverá produzir informações suficientes para facilitar sua operação.

---

# Fluxo Geral de Requisições

O fluxo padrão da plataforma ocorre conforme o diagrama abaixo.

```text
Usuário
    │
    ▼
CloudFront
    │
    ▼
S3
    │
    ▼
JavaScript
    │
    ▼
API Gateway
    │
    ▼
Lambda
    │
    ▼
DynamoDB
```

Sempre que possível, o processamento permanece desacoplado da interface.

---

# Fluxo Administrativo

O Dashboard Administrativo utiliza a mesma arquitetura básica.

```text
Administrador
      │
      ▼
Dashboard
      │
      ▼
API Gateway
      │
      ▼
Lambdas
      │
      ▼
CloudWatch
DynamoDB
CloudFront
```

Essa arquitetura permite centralizar indicadores operacionais sem necessidade de acessar diretamente a Console AWS.

---

# Arquitetura Serverless

O CloudTrilhas adota uma arquitetura predominantemente serverless.

Essa abordagem proporciona.

- Escalabilidade automática.
- Redução de custos.
- Menor esforço operacional.
- Atualizações independentes.
- Facilidade de evolução.

Sempre que possível, novas funcionalidades deverão seguir esse mesmo modelo arquitetural.

---

# Princípios Arquiteturais

A arquitetura da plataforma foi construída seguindo alguns princípios fundamentais.

## Desacoplamento

Cada componente possui responsabilidade específica.

Mudanças em um módulo devem produzir o menor impacto possível nos demais.

---

## Simplicidade

Sempre será adotada a solução mais simples capaz de resolver o problema.

---

## Escalabilidade

Todos os componentes devem suportar crescimento gradual da plataforma.

---

## Reutilização

Sempre que possível, componentes existentes deverão ser reutilizados antes da criação de novos serviços.

---

## Observabilidade

Toda funcionalidade deverá produzir métricas suficientes para acompanhamento operacional.

---

## Segurança

Toda evolução arquitetural deverá respeitar o princípio do menor privilégio e reduzir ao máximo a superfície de exposição da plataforma.

---

# Escalabilidade

A arquitetura foi concebida para permitir evolução incremental.

Novos módulos poderão ser adicionados sem necessidade de reestruturar toda a plataforma.

Essa estratégia reduz riscos durante novas implementações e facilita manutenção de longo prazo.

---

# Evolução da Arquitetura

O CloudTrilhas continuará evoluindo de forma incremental.

Entre as evoluções planejadas destacam-se.

- Ampliação do Operations Center.
- Novos indicadores operacionais.
- Inteligência Artificial.
- Recomendações personalizadas.
- Analytics avançado.
- Melhorias em observabilidade.
- Expansão das funcionalidades administrativas.

Toda nova evolução deverá preservar os princípios arquiteturais definidos neste documento.

---

# Considerações Finais

A arquitetura do CloudTrilhas foi projetada para equilibrar simplicidade, baixo custo, escalabilidade e facilidade de manutenção.

Ao centralizar responsabilidades, desacoplar componentes e utilizar serviços gerenciados da AWS, a plataforma permanece preparada para evoluir continuamente sem comprometer estabilidade ou experiência dos usuários.

Este documento representa a visão arquitetural oficial do projeto e deverá ser atualizado sempre que ocorrerem mudanças estruturais significativas.

---

# Próximo Documento

O próximo documento apresenta os domínios da plataforma.

Nele será definida oficialmente a divisão de responsabilidades entre as diferentes áreas do CloudTrilhas, estabelecendo uma organização lógica para toda evolução futura do projeto.

**Documento seguinte:** `04-Dominios-da-Plataforma.md`

---

> **Arquitetura não é apenas a escolha de tecnologias.**
>
> **É a definição de como uma plataforma pode evoluir de forma organizada, sustentável e preparada para o futuro.**