# 06 - Arquitetura de Dados

> **Documento:** Engineering Blueprint  
> **Versão:** 2.0  
> **Status:** Em evolução  
> **Última atualização:** Julho/2026

---

# Objetivo

Este documento define a estratégia de armazenamento de dados do CloudTrilhas.

Seu objetivo é documentar como as informações são organizadas, armazenadas, protegidas e utilizadas pela plataforma, estabelecendo princípios para sua evolução.

A Arquitetura de Dados deve garantir simplicidade, escalabilidade, segurança, baixo custo operacional e facilidade de manutenção.

---

# Sumário

- Visão Geral
- Objetivos da Arquitetura de Dados
- Princípios
- Tipos de Dados
- Fontes de Dados
- Persistência
- Consumo dos Dados
- Segurança dos Dados
- Governança
- Evolução da Arquitetura
- Considerações Finais
- Próximo Documento

---

# Visão Geral

O CloudTrilhas utiliza uma arquitetura de dados simples, totalmente alinhada ao modelo serverless adotado pela plataforma.

Os dados armazenados possuem finalidades específicas e são utilizados para apoiar funcionalidades operacionais, administrativas e educacionais.

A estratégia atual prioriza:

- simplicidade;
- baixo custo;
- escalabilidade;
- baixa necessidade de administração;
- integração com serviços AWS.

Sempre que possível, evita-se duplicação de informações.

---

# Objetivos da Arquitetura de Dados

A arquitetura foi projetada para atender aos seguintes objetivos.

- Centralizar informações importantes.
- Evitar redundância de dados.
- Facilitar consultas.
- Reduzir custos de armazenamento.
- Garantir segurança.
- Permitir evolução incremental.
- Apoiar observabilidade.
- Apoiar Analytics.

---

# Princípios

Toda evolução da arquitetura de dados deverá respeitar os princípios abaixo.

## Simplicidade

Os modelos de dados devem permanecer simples e fáceis de compreender.

---

## Escalabilidade

O crescimento da plataforma não deve exigir reestruturações frequentes do armazenamento.

---

## Segurança

Dados sensíveis deverão possuir proteção adequada e acesso restrito.

---

## Baixo Custo

Toda estratégia de armazenamento deverá considerar impacto financeiro.

---

## Reutilização

Sempre que possível, informações já existentes deverão ser reutilizadas.

---

## Observabilidade

Os dados devem permitir geração de métricas, indicadores e dashboards.

---

# Tipos de Dados

Os dados utilizados pelo CloudTrilhas podem ser classificados em diferentes categorias.

## Dados Institucionais

Informações relacionadas à própria plataforma.

Exemplos:

- trilhas;
- módulos;
- materiais;
- conteúdos.

---

## Dados Operacionais

Informações utilizadas durante a operação da plataforma.

Exemplos:

- métricas;
- logs;
- indicadores;
- estatísticas.

---

## Dados Administrativos

Informações utilizadas pelo Operations Center.

Exemplos:

- leads;
- visitantes;
- downloads;
- acessos;
- analytics.

---

## Dados Técnicos

Informações utilizadas durante a operação da infraestrutura.

Exemplos:

- métricas AWS;
- alarmes;
- eventos;
- deploys;
- custos.

---

# Fontes de Dados

Os dados podem ser originados por diferentes componentes da plataforma.

Entre eles.

- Portal Público.
- Dashboard Administrativo.
- APIs.
- AWS Lambda.
- CloudWatch.
- EventBridge.
- Serviços AWS.

Cada componente é responsável apenas pelos dados relacionados à sua função.

---

# Persistência

O armazenamento de dados deve priorizar serviços gerenciados pela AWS.

A escolha da tecnologia deverá considerar:

- simplicidade operacional;
- escalabilidade;
- custo;
- disponibilidade;
- integração com a arquitetura existente.

Sempre que possível serão utilizados serviços serverless.

---

# Consumo dos Dados

As informações armazenadas poderão ser utilizadas por diferentes domínios da plataforma.

Exemplos.

## Plataforma Pública

Consulta informações necessárias para funcionamento do portal.

---

## Operations Center

Consome indicadores operacionais.

---

## Analytics

Produz relatórios e estatísticas.

---

## Observabilidade

Utiliza métricas para monitoramento.

---

## Inteligência Artificial

Futuramente utilizará dados para recomendações e automações.

---

# Segurança dos Dados

Toda informação armazenada deverá respeitar os princípios definidos pelo CloudTrilhas.

Entre eles.

- menor privilégio;
- criptografia quando aplicável;
- acesso restrito;
- auditoria;
- rastreabilidade.

Informações sensíveis nunca deverão ser expostas diretamente ao usuário.

---

# Governança

Toda alteração relacionada aos dados deverá seguir o fluxo oficial do projeto.

Antes da implementação deverão ser avaliados.

- necessidade da informação;
- impacto na arquitetura;
- custo;
- segurança;
- documentação.

O modelo de dados deverá permanecer consistente durante toda evolução da plataforma.

---

# Evolução da Arquitetura

A arquitetura de dados continuará evoluindo conforme novas funcionalidades forem incorporadas ao CloudTrilhas.

Entre as evoluções previstas destacam-se.

- ampliação do Analytics;
- novos indicadores operacionais;
- métricas históricas;
- integração com Inteligência Artificial;
- novos dashboards;
- recomendações inteligentes.

Toda evolução deverá preservar simplicidade e baixo custo operacional.

---

# Considerações Finais

A Arquitetura de Dados do CloudTrilhas foi concebida para apoiar o crescimento sustentável da plataforma.

Mais do que armazenar informações, ela fornece a base necessária para Analytics, Observabilidade, FinOps, administração e futuras funcionalidades baseadas em Inteligência Artificial.

Sua evolução deverá ocorrer de forma incremental, sempre respeitando os princípios estabelecidos neste Engineering Blueprint.

---

# Próximo Documento

O próximo documento apresenta a estratégia de evolução da plataforma.

Serão definidos o roadmap, as releases, os épicos e a visão de longo prazo para o CloudTrilhas.

**Documento seguinte:** `07-Evolucao-da-Plataforma.md`

---

> **Os dados são um ativo estratégico da plataforma.**
>
> **Uma arquitetura de dados bem planejada permite evoluir funcionalidades sem aumentar a complexidade da solução.**