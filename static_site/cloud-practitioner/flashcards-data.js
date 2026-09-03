/**
 * CloudTrilhas — Flash Cards Cloud Practitioner (CLF-C02)
 *
 * Dados extraídos da planilha de escopo do exame (Produtos e serviços — CCP).
 * Cada card: { categoria, servico, oque (para que serve), chave (palavra-chave) }.
 * "chave" vazia = card sem palavra-chave definida na planilha.
 */
window.CCP_FLASHCARDS = [
  // ===== ANÁLISE =====
  { categoria: "Análise", servico: "Amazon Athena", oque: "Consulte dados no S3 usando SQL.", chave: "Consulta no S3 + SQL" },
  { categoria: "Análise", servico: "Amazon EMR (Elastic MapReduce)", oque: "Framework do Hadoop hospedado.", chave: "Hadoop gerenciado — Big Data" },
  { categoria: "Análise", servico: "Amazon Kinesis", oque: "Analise fluxos de vídeo e dados em tempo real.", chave: "Análise em tempo real" },
  { categoria: "Análise", servico: "Amazon OpenSearch", oque: "Pesquise, visualize e analise até petabytes de texto e dados.", chave: "Pesquisa e análise de texto" },
  { categoria: "Análise", servico: "Amazon QuickSight", oque: "Serviço rápido de análise empresarial (usa ML) — dashboards.", chave: "Dashboard" },
  { categoria: "Análise", servico: "AWS Glue", oque: "Serviço ETL para extrair, transformar e carregar dados.", chave: "ETL — transformar e carregar dados" },
  { categoria: "Análise", servico: "Amazon Redshift", oque: "Usa SQL para analisar dados estruturados e semiestruturados em data warehousing.", chave: "Análise em Data Warehouse — SQL — grandes volumes" },

  // ===== INTEGRAÇÃO DE APLICAÇÕES =====
  { categoria: "Integração de Aplicações", servico: "Amazon EventBridge", oque: "Crie aplicações orientadas por eventos em escala na AWS, sistemas existentes ou SaaS.", chave: "Eventos" },
  { categoria: "Integração de Aplicações", servico: "Amazon SNS (Simple Notification Service)", oque: "Serviço de envio de mensagens de publicação/assinatura (pub/sub).", chave: "Envio de mensagens — mensageria" },
  { categoria: "Integração de Aplicações", servico: "Amazon SQS (Simple Queue Service)", oque: "Serviço de fila de mensagens.", chave: "Fila de mensagens — desacoplar serviços — microserviços" },
  { categoria: "Integração de Aplicações", servico: "AWS Step Functions", oque: "Serviço de fluxo de trabalho para aplicações distribuídas.", chave: "Fluxo de trabalho" },
  { categoria: "Integração de Aplicações", servico: "Amazon SES (Simple Email Service)", oque: "Serviço de entrega de campanhas de e-mail de alto volume.", chave: "E-mail em massa" },
  { categoria: "Integração de Aplicações", servico: "Amazon Connect", oque: "Central de atendimento na nuvem, omnichannel.", chave: "Central de atendimento — call center" },

  // ===== GERENCIAMENTO FINANCEIRO =====
  { categoria: "Gerenciamento Financeiro", servico: "AWS Budgets", oque: "Defina orçamentos personalizados de custo e uso.", chave: "Orçamentos — alertas de gasto/uso" },
  { categoria: "Gerenciamento Financeiro", servico: "AWS Cost Explorer", oque: "Explorador de custos. Analise seus custos na AWS.", chave: "Análise de custo — previsão de gastos" },
  { categoria: "Gerenciamento Financeiro", servico: "AWS Marketplace", oque: "Plataforma para comprar e vender software de terceiros.", chave: "Software de terceiros" },
  { categoria: "Gerenciamento Financeiro", servico: "AWS Cost and Usage Report (relatório de uso e custo)", oque: "Examina em detalhes os custos e dados de uso da AWS.", chave: "Fatura mensal — detalhamento de custos" },

  // ===== COMPUTAÇÃO =====
  { categoria: "Computação", servico: "Amazon EC2 Auto Scaling", oque: "Escale a capacidade computacional para atender à demanda.", chave: "Ajustar capacidade — dimensionamento" },
  { categoria: "Computação", servico: "AWS Auto Scaling", oque: "Monitora aplicações e ajusta automaticamente a capacidade, mantendo desempenho e menor custo.", chave: "Ajustar capacidade — dimensionamento" },
  { categoria: "Computação", servico: "Amazon EC2", oque: "Servidores virtuais na nuvem.", chave: "Servidores virtuais" },
  { categoria: "Computação", servico: "Amazon Lightsail", oque: "Crie aplicações e sites rapidamente com recursos de nuvem pré-configurados e de baixo custo.", chave: "Site/app simples e barato" },
  { categoria: "Computação", servico: "AWS Batch", oque: "Serviço para executar processamento em lote na nuvem.", chave: "Processamento em lote" },
  { categoria: "Computação", servico: "AWS Elastic Beanstalk", oque: "Serviço gerenciado para implantação e escalabilidade fácil de apps e serviços web.", chave: "Implantar app sem gerenciar infraestrutura" },
  { categoria: "Computação", servico: "AWS Outposts", oque: "Execute a infraestrutura da AWS on-premises.", chave: "AWS on-premises" },

  // ===== CONTÊINERES =====
  { categoria: "Contêineres", servico: "Amazon EKS (Elastic Kubernetes Service)", oque: "Kubernetes gerenciado, na AWS e em ambientes on-premises.", chave: "Kubernetes" },
  { categoria: "Contêineres", servico: "Amazon ECS (Elastic Container Service)", oque: "Orquestração de contêineres totalmente gerenciada — implantação, gerência e escala.", chave: "Orquestração de contêiner Docker" },
  { categoria: "Contêineres", servico: "Amazon ECR (Elastic Container Registry)", oque: "Registro de contêineres seguro e privado para armazenar e distribuir imagens Docker.", chave: "Imagem/registro de contêiner Docker" },

  // ===== INTEGRAÇÃO COM OS CLIENTES =====
  { categoria: "Interação com Clientes", servico: "AWS Support", oque: "Suporte técnico da AWS em diferentes níveis (24/7, especialistas, análise de arquitetura).", chave: "Suporte técnico" },

  // ===== BANCOS DE DADOS =====
  { categoria: "Bancos de Dados", servico: "Amazon ElastiCache", oque: "Banco de dados em memória para aplicações com resposta em milissegundos.", chave: "Cache em memória — baixa latência" },
  { categoria: "Bancos de Dados", servico: "Amazon DocumentDB", oque: "Banco de dados de documentos — gerência de conteúdo, catálogos, perfis de usuário.", chave: "Banco de documentos" },
  { categoria: "Bancos de Dados", servico: "Amazon RDS (Relational Database Service)", oque: "Banco relacional escalável, patch/backup/provisionamento automáticos. Suporta Aurora, MySQL, MariaDB, PostgreSQL, Oracle, SQL Server.", chave: "Banco de dados relacional — SQL" },
  { categoria: "Bancos de Dados", servico: "Amazon DynamoDB", oque: "Banco não relacional (NoSQL) chave-valor e documento, milissegundos, gerenciado, virtualmente ilimitado.", chave: "Banco de dados NoSQL" },
  { categoria: "Bancos de Dados", servico: "Amazon Aurora", oque: "Banco relacional gerenciado de alta performance e disponibilidade, escala automática.", chave: "SQL — relacional — compatível MySQL/PostgreSQL" },
  { categoria: "Bancos de Dados", servico: "Amazon Neptune", oque: "Banco de dados de grafos totalmente gerenciado.", chave: "Gráfico — grafos" },

  // ===== DESENVOLVEDOR =====
  { categoria: "Desenvolvedor", servico: "AWS CLI", oque: "Interface de linha de comando para gerenciar serviços da AWS pelo terminal.", chave: "Terminal — acesso programático" },
  { categoria: "Desenvolvedor", servico: "AWS CodeBuild", oque: "Serviço gerenciado para compilar, testar e empacotar o código-fonte.", chave: "Compilar código (build)" },
  { categoria: "Desenvolvedor", servico: "AWS CodePipeline", oque: "Serviço de entrega contínua que automatiza o fluxo de trabalho.", chave: "Entrega contínua (CI/CD)" },
  { categoria: "Desenvolvedor", servico: "AWS X-Ray", oque: "Rastreamento e análise de aplicações, com visão detalhada do que funciona e o que melhorar.", chave: "Monitoramento/rastreamento de aplicações" },

  // ===== COMPUTAÇÃO DE USUÁRIO FINAL =====
  { categoria: "Computação de Usuário Final", servico: "Amazon AppStream 2.0", oque: "Streaming de aplicações para usuários, seguro e escalável.", chave: "Streaming de aplicações" },
  { categoria: "Computação de Usuário Final", servico: "Amazon WorkSpaces", oque: "Desktop virtual na nuvem, acessível de qualquer lugar.", chave: "Desktop virtual" },
  { categoria: "Computação de Usuário Final", servico: "Amazon WorkSpaces Web", oque: "Acesso seguro a aplicações via navegador, de qualquer dispositivo.", chave: "Acesso via navegador" },

  // ===== WEB E FRONT-END =====
  { categoria: "Web e Front-end", servico: "AWS Amplify", oque: "Ferramentas e serviços para acelerar o desenvolvimento de apps móveis e web.", chave: "Desenvolvimento web/mobile" },
  { categoria: "Web e Front-end", servico: "AWS AppSync", oque: "Conecte apps a dados e eventos com APIs GraphQL e Pub/Sub, seguras e serverless.", chave: "GraphQL — API serverless" },
  { categoria: "Web e Front-end", servico: "AWS IoT Core", oque: "Conecte dispositivos à nuvem de forma fácil e segura.", chave: "Internet das coisas (IoT)" },

  // ===== MACHINE LEARNING =====
  { categoria: "Machine Learning", servico: "Amazon Kendra", oque: "Pesquisa com ML que encontra informações em diferentes fontes de dados.", chave: "Busca inteligente" },
  { categoria: "Machine Learning", servico: "Amazon Q", oque: "Assistente de IA generativa da AWS.", chave: "Assistente de IA generativa" },
  { categoria: "Machine Learning", servico: "Amazon Lex", oque: "Criação de interfaces de conversação natural — chatbot de voz e texto.", chave: "Chatbot — assistente virtual" },
  { categoria: "Machine Learning", servico: "Amazon Textract", oque: "Extração de texto impresso, manuscrito e dados de qualquer documento (ML).", chave: "Extrair texto de documentos" },
  { categoria: "Machine Learning", servico: "Amazon Transcribe", oque: "Converte áudio em texto.", chave: "Transcrição de áudio para texto" },
  { categoria: "Machine Learning", servico: "Amazon SageMaker", oque: "Crie, treine e implante modelos de ML com infraestrutura e fluxos gerenciados.", chave: "Criar e treinar Machine Learning" },
  { categoria: "Machine Learning", servico: "Amazon Polly", oque: "Converte texto em áudio/fala realista.", chave: "Converte texto em fala" },
  { categoria: "Machine Learning", servico: "Amazon Rekognition", oque: "Analisa imagens e vídeos — identifica objetos, texto e rostos.", chave: "Reconhecer objetos — análise de imagens/vídeos" },
  { categoria: "Machine Learning", servico: "Amazon Translate", oque: "Serviço de tradução (formal/informal) com deep learning.", chave: "Tradução — traduzir" },
  { categoria: "Machine Learning", servico: "Amazon Comprehend", oque: "Analisa e compreende texto em linguagem natural, extraindo insights.", chave: "Sentimento em texto — compreender texto" },

  // ===== GERENCIAMENTO E GOVERNANÇA =====
  { categoria: "Gerenciamento e Governança", servico: "AWS Cloud Adoption Framework (CAF)", oque: "Transformação digital para adoção da nuvem: Negócios, Pessoas, Governança, Plataforma, Segurança, Operações.", chave: "Ir para a nuvem (estratégia)" },
  { categoria: "Gerenciamento e Governança", servico: "Amazon CloudWatch", oque: "Monitoramento e desempenho de recursos e aplicações. Coletar → monitorar → atuar → analisar.", chave: "Monitoramento de recursos — performance" },
  { categoria: "Gerenciamento e Governança", servico: "AWS CloudTrail", oque: "Governança, conformidade e auditoria operacional — registra ações e chamadas de API.", chave: "Chamadas de API e ações do usuário — auditoria (dedo-duro)" },
  { categoria: "Gerenciamento e Governança", servico: "Console de Gerenciamento da AWS", oque: "Interface gráfica web para gerenciar e configurar serviços e recursos.", chave: "Interface gráfica" },
  { categoria: "Gerenciamento e Governança", servico: "AWS Health Dashboard", oque: "Insights e notificações em tempo real sobre o status dos serviços da AWS.", chave: "Status dos serviços AWS" },
  { categoria: "Gerenciamento e Governança", servico: "AWS Control Tower", oque: "Configure e governe um ambiente seguro multicontas, orquestrando vários serviços.", chave: "Gerenciar contas — conformidade de ambiente" },
  { categoria: "Gerenciamento e Governança", servico: "AWS Organizations", oque: "Consolida faturas e gerencia várias contas em um único local.", chave: "Consolidar faturamento — gerência de contas" },
  { categoria: "Gerenciamento e Governança", servico: "AWS CloudFormation", oque: "Infraestrutura como código (IaC).", chave: "Implantação repetível — IaC" },
  { categoria: "Gerenciamento e Governança", servico: "AWS Trusted Advisor", oque: "Recomendações de custo, performance, segurança, tolerância a falhas, limites e excelência operacional.", chave: "Recomendações — otimização" },
  { categoria: "Gerenciamento e Governança", servico: "AWS Well-Architected Tool", oque: "Excelência operacional, segurança, confiabilidade, eficiência, custos e sustentabilidade.", chave: "Revisão de arquitetura" },
  { categoria: "Gerenciamento e Governança", servico: "AWS Config", oque: "Acessa, audita e avalia configurações de recursos (regional; histórico em bucket S3).", chave: "Configuração de recursos" },
  { categoria: "Gerenciamento e Governança", servico: "AWS Service Catalog", oque: "Crie, compartilhe, organize e governe modelos de IaC selecionados.", chave: "Catálogo de serviços" },
  { categoria: "Gerenciamento e Governança", servico: "AWS Compute Optimizer", oque: "Recomendações para otimizar o uso ideal de recursos.", chave: "Otimizar recursos" },
  { categoria: "Gerenciamento e Governança", servico: "AWS License Manager", oque: "Gerencia suas licenças de software.", chave: "Licenças de software" },
  { categoria: "Gerenciamento e Governança", servico: "AWS Systems Manager", oque: "Gerencie recursos na AWS e em ambientes de várias nuvens e híbridos.", chave: "Automação de atualizações/operações" },

  // ===== MIGRAÇÃO E TRANSFERÊNCIA =====
  { categoria: "Migração e Transferência", servico: "AWS Database Migration Service (DMS)", oque: "Migração de banco de dados para a nuvem AWS.", chave: "Migrar banco de dados" },
  { categoria: "Migração e Transferência", servico: "AWS Migration Hub", oque: "Centraliza e acompanha todas as migrações em um único lugar.", chave: "Acompanhar migrações" },
  { categoria: "Migração e Transferência", servico: "Família AWS Snow", oque: "Dispositivos físicos para transferência de dados em larga escala (Snowcone, Snowball, Snowmobile).", chave: "Transferência física de dados" },
  { categoria: "Migração e Transferência", servico: "AWS Application Discovery Service", oque: "Descobre e mapeia ambientes locais para planejar migrações.", chave: "Mapear ambiente local" },
  { categoria: "Migração e Transferência", servico: "AWS Application Migration Service", oque: "Converte servidores físicos, virtuais ou em nuvem para a AWS, com mínima inatividade.", chave: "Migrar servidores (lift-and-shift)" },
  { categoria: "Migração e Transferência", servico: "AWS Schema Conversion Tool (SCT)", oque: "Converte esquemas de banco de dados incompatíveis entre origem e destino.", chave: "Converter esquema de banco" },

  // ===== REDES E ENTREGA DE CONTEÚDO =====
  { categoria: "Redes e Entrega de Conteúdo", servico: "Elastic Load Balancer (ELB)", oque: "Distribui automaticamente o tráfego entre EC2, contêineres, IPs e funções Lambda.", chave: "Balanceamento de carga — distribuir carga" },
  { categoria: "Redes e Entrega de Conteúdo", servico: "AWS Transit Gateway", oque: "Conecta VPCs, contas e redes on-premises a um único gateway (hub central).", chave: "Conectar várias VPCs" },
  { categoria: "Redes e Entrega de Conteúdo", servico: "AWS App Mesh", oque: "Rede ao nível de aplicações para todos os seus serviços.", chave: "Service mesh" },
  { categoria: "Redes e Entrega de Conteúdo", servico: "Amazon VPC (Virtual Private Cloud)", oque: "Rede isolada logicamente, com controle total do ambiente virtual.", chave: "Rede virtual" },
  { categoria: "Redes e Entrega de Conteúdo", servico: "Amazon Route 53", oque: "Atua como DNS e registro de domínio.", chave: "DNS" },
  { categoria: "Redes e Entrega de Conteúdo", servico: "Amazon CloudFront", oque: "Entrega de conteúdo (CDN) com segurança, baixa latência e alta velocidade.", chave: "Entrega de conteúdo — CDN" },
  { categoria: "Redes e Entrega de Conteúdo", servico: "AWS Direct Connect", oque: "Conexão dedicada e direta entre ambientes locais e a AWS.", chave: "Conexão dedicada" },
  { categoria: "Redes e Entrega de Conteúdo", servico: "AWS VPN (Virtual Private Network)", oque: "Estende redes locais para a nuvem com segurança (Client VPN e Site-to-Site VPN).", chave: "Túnel privado — acesso seguro" },
  { categoria: "Redes e Entrega de Conteúdo", servico: "AWS Global Accelerator", oque: "Melhora disponibilidade, performance e segurança usando a rede global da AWS.", chave: "Acelerar acesso global" },
  { categoria: "Redes e Entrega de Conteúdo", servico: "Amazon API Gateway", oque: "Serviço gerenciado para criar, publicar, manter, monitorar e proteger APIs em qualquer escala.", chave: "API — API REST" },

  // ===== SEGURANÇA =====
  { categoria: "Segurança", servico: "AWS IAM (Identity and Access Management)", oque: "Gerencia acesso seguro aos recursos com políticas, usuários, grupos e funções.", chave: "Criar usuários — funções — políticas" },
  { categoria: "Segurança", servico: "AWS IAM Identity Center (SSO)", oque: "Acesso centralizado a várias contas e apps com logon único (SSO).", chave: "Logon único (SSO)" },
  { categoria: "Segurança", servico: "AWS Artifact", oque: "Repositório de documentos de conformidade e relatórios de auditoria.", chave: "Relatórios de auditoria/conformidade" },
  { categoria: "Segurança", servico: "Amazon Inspector", oque: "Gerência automatizada de vulnerabilidades em cargas de trabalho no EC2.", chave: "Vulnerabilidades — EC2 — carga de trabalho" },
  { categoria: "Segurança", servico: "AWS Security Hub", oque: "Gerência de segurança na nuvem (CSPM), agrega informações em um único local.", chave: "Segurança centralizada" },
  { categoria: "Segurança", servico: "Amazon GuardDuty", oque: "Detecção de ameaças — monitora contas e cargas de trabalho, detecta atividade maliciosa.", chave: "Ameaças — atividades maliciosas" },
  { categoria: "Segurança", servico: "AWS RAM (Resource Access Manager)", oque: "Simplifica e centraliza o compartilhamento de recursos entre contas.", chave: "Compartilhar recursos entre contas" },
  { categoria: "Segurança", servico: "Amazon Detective", oque: "Visão consolidada para simplificar a detecção e investigação de ameaças.", chave: "Investigar — detectar" },
  { categoria: "Segurança", servico: "AWS Secrets Manager", oque: "Armazena, recupera e rotaciona segredos (senhas, chaves de API).", chave: "Segredos — rotacionar senhas" },
  { categoria: "Segurança", servico: "AWS Directory Service", oque: "Use Microsoft Active Directory (AD) com serviços AWS.", chave: "Active Directory gerenciado" },
  { categoria: "Segurança", servico: "AWS Firewall Manager", oque: "Implementa política de segurança em um único local, com regras de acesso e detecção de ameaças.", chave: "Gerência central de firewall" },
  { categoria: "Segurança", servico: "AWS KMS (Key Management Service)", oque: "Criação e controle de chaves criptográficas para proteger dados.", chave: "Criptografia — chaves" },
  { categoria: "Segurança", servico: "Amazon Macie", oque: "Segurança e privacidade de dados usando ML no S3.", chave: "Dados sensíveis no S3" },
  { categoria: "Segurança", servico: "Amazon Cognito", oque: "Acesso de usuários a apps web/móveis, com login social (Facebook, Google).", chave: "Login em aplicativos" },
  { categoria: "Segurança", servico: "AWS Audit Manager", oque: "Audite continuamente o uso da AWS para avaliação de risco e conformidade.", chave: "Auditoria contínua" },
  { categoria: "Segurança", servico: "AWS Certificate Manager (ACM)", oque: "Provisione e gerencie certificados SSL/TLS.", chave: "Certificado SSL/TLS" },
  { categoria: "Segurança", servico: "AWS CloudHSM", oque: "Gerencie Hardware Security Modules (HSMs) para gestão de chaves.", chave: "HSM — hardware de chaves" },
  { categoria: "Segurança", servico: "AWS WAF", oque: "Firewall de aplicações web contra bots e ataques; permite ou bloqueia tráfego.", chave: "Injeção SQL — firewall web" },
  { categoria: "Segurança", servico: "AWS Shield", oque: "Serviço gerenciado de proteção contra DDoS.", chave: "DDoS" },
  { categoria: "Segurança", servico: "AWS Network Firewall", oque: "Implantação de firewall de rede nas VPCs.", chave: "Firewall de rede — VPC" },

  // ===== SEM SERVIDOR =====
  { categoria: "Sem Servidor", servico: "AWS Fargate", oque: "Computação sem servidor para executar contêineres, pagando pelo uso.", chave: "Contêiner serverless — sem servidor" },
  { categoria: "Sem Servidor", servico: "AWS Lambda", oque: "Execute código sem provisionar servidores; paga por requisição e tempo (até 15 min).", chave: "Serverless — invocação de código" },

  // ===== ARMAZENAMENTO =====
  { categoria: "Armazenamento", servico: "Amazon S3", oque: "Armazenamento e recuperação de objetos (ilimitado). Site estático, snapshots, backups, armazenamento híbrido.", chave: "Armazenamento de objetos" },
  { categoria: "Armazenamento", servico: "S3 Standard", oque: "Uso geral, recuperação imediata.", chave: "Uso frequente" },
  { categoria: "Armazenamento", servico: "S3 Intelligent-Tiering", oque: "Uso geral com movimentação automática entre camadas.", chave: "Movimentação automática de camadas" },
  { categoria: "Armazenamento", servico: "S3 Standard-IA", oque: "Menor frequência, ideal para backup.", chave: "Uso infrequente" },
  { categoria: "Armazenamento", servico: "S3 One Zone-IA", oque: "Menor frequência, mas em apenas uma zona de disponibilidade.", chave: "Uso infrequente — 1 AZ" },
  { categoria: "Armazenamento", servico: "S3 Glacier", oque: "Arquivos de longo prazo, recuperação em minutos ou horas.", chave: "Arquivamento de longo prazo" },
  { categoria: "Armazenamento", servico: "S3 Glacier Deep Archive", oque: "Retenção de longo prazo (7+ anos), recuperação em até 12 horas.", chave: "Arquivamento longo — horas para recuperar" },
  { categoria: "Armazenamento", servico: "S3 Glacier Instant Retrieval", oque: "Baixo custo com recuperação em milissegundos para dados raramente acessados.", chave: "Arquivo com acesso instantâneo" },
  { categoria: "Armazenamento", servico: "Amazon EBS (Elastic Block Store)", oque: "Armazenamento de blocos persistente, conectado ao EC2 como um disco.", chave: "Armazenamento em blocos" },
  { categoria: "Armazenamento", servico: "Amazon EFS (Elastic File System)", oque: "Sistema de arquivos de rede elástico, múltiplas AZs e múltiplos EC2 — voltado a Linux (NFS).", chave: "Sistema de arquivos — NFS — Linux" },
  { categoria: "Armazenamento", servico: "AWS Elastic Disaster Recovery", oque: "Replica servidores de produção para a AWS e permite recuperação rápida.", chave: "Recuperação de desastres" },
  { categoria: "Armazenamento", servico: "AWS Storage Gateway", oque: "Conecta o ambiente on-premises ao armazenamento na nuvem AWS.", chave: "Armazenamento compartilhado local + nuvem" },
  { categoria: "Armazenamento", servico: "Amazon FSx", oque: "File server (SMB/NFS), suporte a Windows e cargas de aprendizado de máquina.", chave: "Sistema de arquivos — SMB — Windows" },
  { categoria: "Armazenamento", servico: "AWS Backup", oque: "Gerencia e automatiza a proteção de dados de forma centralizada entre serviços.", chave: "Backup centralizado" },

  // ===== TIPOS DE INSTÂNCIA EC2 =====
  { categoria: "Tipos de Instância EC2", servico: "Sob Demanda (On-Demand)", oque: "Cargas variáveis e imprevisíveis, sem compromisso de longo prazo.", chave: "Teste e uso imprevisível" },
  { categoria: "Tipos de Instância EC2", servico: "Reservadas (Reserved)", oque: "Cargas estáveis e previsíveis, uso garantido por longos períodos.", chave: "Uso constante — previsibilidade — não pode falhar" },
  { categoria: "Tipos de Instância EC2", servico: "Spot", oque: "Cargas flexíveis e tolerantes a falhas (lote, Big Data, testes).", chave: "Suportar falhas — mais barato" },
  { categoria: "Tipos de Instância EC2", servico: "Dedicadas (Dedicated Instances)", oque: "Ambientes que exigem isolamento físico por conformidade/regulação.", chave: "Isolamento físico" },
  { categoria: "Tipos de Instância EC2", servico: "Hosts Dedicados (Dedicated Hosts)", oque: "Controle físico completo do servidor para cumprir licenças de software.", chave: "Controle do hardware — manter a licença do cliente" },

  // ===== INFRAESTRUTURA GLOBAL =====
  { categoria: "Infraestrutura Global", servico: "Regiões da AWS (Regions)", oque: "Local geográfico onde a AWS concentra data centers, com baixa latência regional.", chave: "Local geográfico" },
  { categoria: "Infraestrutura Global", servico: "Zonas de Disponibilidade (AZs)", oque: "Área distinta dentro de uma Região, com data centers separados e conectados com baixa latência.", chave: "Data centers isolados na Região" },
  { categoria: "Infraestrutura Global", servico: "Pontos de Presença (Edge Locations)", oque: "Locais de borda para otimizar a entrega de conteúdo com baixa latência.", chave: "Borda — entrega de conteúdo" }
];
