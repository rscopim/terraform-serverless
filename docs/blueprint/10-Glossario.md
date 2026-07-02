# 10 - Glossário

> **Documento:** Engineering Blueprint  
> **Versão:** 2.0  
> **Status:** Em evolução  
> **Última atualização:** Julho/2026

---

# Objetivo

Este documento reúne os principais termos, siglas e conceitos utilizados ao longo do Engineering Blueprint do CloudTrilhas.

Seu objetivo é padronizar a linguagem adotada na documentação, facilitar a leitura e servir como referência para estudantes, colaboradores e futuros mantenedores da plataforma.

Sempre que novos conceitos forem incorporados ao projeto, este glossário deverá ser atualizado.

---

# Sumário

- Como utilizar este Glossário
- Termos Gerais
- Arquitetura
- AWS
- DevOps
- Infraestrutura como Código
- FinOps
- Observabilidade
- Segurança
- Inteligência Artificial
- Documentação
- Considerações Finais

---

# Como utilizar este Glossário

Os termos apresentados neste documento seguem o contexto específico do CloudTrilhas.

Embora muitos deles sejam amplamente utilizados na indústria de tecnologia, suas definições refletem a forma como são aplicados dentro da arquitetura e dos processos da plataforma.

---

# Termos Gerais

## Blueprint

Conjunto de documentos que descrevem a visão estratégica, arquitetura, padrões de engenharia e evolução do CloudTrilhas.

---

## Plataforma

Conjunto completo de aplicações, infraestrutura, documentação e processos que compõem o CloudTrilhas.

---

## Domínio

Grande área funcional da plataforma.

Exemplos:

- Plataforma Pública
- Operations Center
- Infraestrutura AWS
- DevOps
- Inteligência Artificial

---

## Release

Grande ciclo evolutivo da plataforma.

Cada Release possui um objetivo estratégico e é composta por um ou mais Épicos.

---

## Épico

Conjunto de funcionalidades relacionadas que atendem a um mesmo objetivo de negócio.

---

## Sprint

Período de desenvolvimento com escopo definido e entregas planejadas.

---

## Backlog

Lista priorizada de funcionalidades, melhorias e ideias aguardando planejamento e implementação.

---

# Arquitetura

## Arquitetura

Organização estrutural da plataforma, definindo componentes, responsabilidades e integrações.

---

## Serverless

Modelo arquitetural baseado em serviços gerenciados, reduzindo a necessidade de administração de servidores.

---

## API

Interface responsável pela comunicação entre sistemas e componentes da plataforma.

---

## Camada

Agrupamento lógico de componentes com responsabilidades semelhantes.

Exemplos:

- Apresentação
- Aplicação
- Dados
- Operação

---

## Desacoplamento

Princípio arquitetural que busca reduzir dependências entre componentes da plataforma.

---

## Escalabilidade

Capacidade da plataforma de suportar aumento de carga mantendo desempenho e disponibilidade.

---

# AWS

## CloudFront

Serviço responsável pela distribuição global do conteúdo da plataforma.

---

## S3

Serviço utilizado para armazenamento de arquivos estáticos e materiais disponibilizados pelo CloudTrilhas.

---

## Lambda

Serviço utilizado para execução da lógica de negócio da plataforma.

---

## API Gateway

Serviço responsável por disponibilizar APIs utilizadas pelos componentes da plataforma.

---

## DynamoDB

Banco de dados NoSQL utilizado para armazenamento de informações operacionais.

---

## CloudWatch

Serviço utilizado para monitoramento, métricas, alarmes e logs.

---

## SNS

Serviço utilizado para envio de notificações.

---

## EventBridge

Serviço responsável pela integração baseada em eventos.

---

## Route 53

Serviço responsável pelo gerenciamento do domínio da plataforma.

---

## ACM

Serviço responsável pelo gerenciamento dos certificados digitais utilizados pelo CloudTrilhas.

---

# DevOps

## CI/CD

Processo de Integração Contínua e Entrega Contínua utilizado para automatizar validação e implantação.

---

## GitHub Actions

Ferramenta utilizada para execução automática das pipelines do projeto.

---

## Pull Request

Solicitação formal para revisão e integração de alterações no código.

---

## Pipeline

Fluxo automatizado responsável por validar, testar e implantar alterações.

---

## Deploy

Processo de publicação de uma nova versão da plataforma.

---

# Infraestrutura como Código

## IaC

Prática que permite gerenciar infraestrutura através de código.

---

## Terraform

Ferramenta utilizada para provisionamento e gerenciamento da infraestrutura AWS do CloudTrilhas.

---

## Module

Unidade reutilizável de infraestrutura responsável por encapsular recursos relacionados.

---

## Environment

Conjunto de configurações específicas para um ambiente de implantação.

No CloudTrilhas, o ambiente oficial é:

- Production (prod)

---

# FinOps

## FinOps

Conjunto de práticas voltadas ao gerenciamento eficiente dos custos da infraestrutura em nuvem.

---

## Custo Operacional

Valor necessário para manter a plataforma em funcionamento.

---

## Otimização

Processo contínuo de redução de desperdícios mantendo desempenho e qualidade.

---

# Observabilidade

## Observabilidade

Capacidade de compreender o comportamento da plataforma através de métricas, logs e indicadores.

---

## Métrica

Valor numérico utilizado para acompanhar desempenho ou comportamento de um componente.

---

## Log

Registro detalhado de eventos ocorridos durante a execução da plataforma.

---

## Dashboard

Interface utilizada para visualização de indicadores operacionais.

---

## Alarme

Notificação gerada quando determinada condição operacional é atingida.

---

# Segurança

## Menor Privilégio

Princípio segundo o qual cada componente deve possuir apenas as permissões estritamente necessárias para executar sua função.

---

## Autenticação

Processo responsável por validar a identidade de um usuário ou serviço.

---

## Autorização

Processo responsável por determinar quais ações um usuário ou serviço está autorizado a executar.

---

## Hardening

Conjunto de práticas destinadas a reduzir riscos de segurança em sistemas e infraestrutura.

---

# Inteligência Artificial

## IA Generativa

Tecnologia capaz de produzir conteúdo original a partir de modelos treinados.

---

## Amazon Bedrock

Serviço AWS destinado à utilização de modelos de Inteligência Artificial Generativa.

---

## RAG

Arquitetura que combina modelos generativos com bases de conhecimento para produzir respostas fundamentadas em informações específicas.

---

## LLM

Large Language Model.

Modelo de linguagem utilizado para compreensão e geração de texto.

---

# Documentação

## Engineering Blueprint

Conjunto permanente de documentos que definem arquitetura, princípios e evolução da plataforma.

---

## Documentação de Fase

Documentação técnica que registra uma implementação específica realizada no CloudTrilhas.

---

## README

Documento introdutório responsável por apresentar determinado diretório ou componente do projeto.

---

# Considerações Finais

Este glossário representa a referência oficial de terminologia utilizada pelo CloudTrilhas.

Seu objetivo é manter consistência entre documentação, arquitetura, código e processos de desenvolvimento.

Novos termos deverão ser incorporados sempre que ampliarem o vocabulário técnico da plataforma ou representarem novos conceitos adotados pelo projeto.

---

> **Uma linguagem padronizada reduz ambiguidades, facilita a comunicação e fortalece a documentação técnica.**

---

# Engineering Blueprint — Conclusão

Com a conclusão deste documento, encerra-se a primeira versão do **Engineering Blueprint do CloudTrilhas**.

Este conjunto de documentos estabelece a visão estratégica da plataforma e servirá como referência para todas as futuras decisões de arquitetura, desenvolvimento e operação.

A partir deste ponto, a evolução do CloudTrilhas deverá ocorrer de forma planejada, incremental e alinhada aos princípios definidos neste Blueprint.

O próximo passo será transformar essa estratégia em entregas concretas por meio das Releases, Épicos e Sprints documentados ao longo da evolução da plataforma.