/**
 * CloudTrilhas — Banco de Questões
 * AWS AI Practitioner (AIF-C01)
 *
 * Este arquivo contém todas as questões do simulado.
 * Não sobe para o GitHub (.gitignore).
 * O simulado.html carrega este arquivo antes do simulado.js.
 */

var QUIZ_BANK = [
  {
    question: "Qual tipo de aprendizado de máquina utiliza dados rotulados para treinar o modelo?",
    options: ["A) Aprendizado não-supervisionado", "B) Aprendizado por reforço", "C) Aprendizado supervisionado", "D) Aprendizado semi-supervisionado"],
    correct: 2,
    explanation: "Aprendizado supervisionado utiliza dados rotulados (com respostas conhecidas) para treinar o modelo a fazer previsões. Exemplos: classificação e regressão."
  },
  {
    question: "Uma empresa quer agrupar clientes por comportamento de compra sem categorias pré-definidas. Qual abordagem é mais adequada?",
    options: ["A) Classificação supervisionada", "B) Regressão linear", "C) Clustering (aprendizado não-supervisionado)", "D) Aprendizado por reforço"],
    correct: 2,
    explanation: "Clustering é uma técnica de aprendizado não-supervisionado que agrupa dados similares sem necessidade de rótulos pré-definidos. K-Means é um algoritmo comum."
  },
  {
    question: "Qual serviço AWS permite acessar modelos de fundação de múltiplos provedores (Anthropic, Meta, Amazon) via API unificada?",
    options: ["A) Amazon SageMaker", "B) Amazon Bedrock", "C) Amazon Comprehend", "D) Amazon Lex"],
    correct: 1,
    explanation: "Amazon Bedrock é o serviço serverless que oferece acesso a Foundation Models de diversos provedores (Claude, Llama, Titan) via API unificada, sem gerenciar infraestrutura."
  },
  {
    question: "O que é um 'token' no contexto de Large Language Models (LLMs)?",
    options: ["A) Uma credencial de autenticação", "B) Uma unidade de texto processada pelo modelo (palavra ou parte de palavra)", "C) Um tipo de embedding vetorial", "D) Uma métrica de avaliação do modelo"],
    correct: 1,
    explanation: "Tokens são as unidades básicas de texto que o LLM processa. Podem ser palavras inteiras, partes de palavras ou caracteres. O custo e limites dos modelos são medidos em tokens."
  },
  {
    question: "Qual técnica de Prompt Engineering fornece exemplos na entrada para guiar o modelo?",
    options: ["A) Zero-shot prompting", "B) Chain-of-thought prompting", "C) Few-shot prompting", "D) Temperature tuning"],
    correct: 2,
    explanation: "Few-shot prompting inclui exemplos de entrada/saída no prompt para que o modelo entenda o padrão desejado. Zero-shot não usa exemplos, e chain-of-thought pede raciocínio passo a passo."
  },
  {
    question: "O que é RAG (Retrieval-Augmented Generation)?",
    options: ["A) Um método de fine-tuning de modelos", "B) Uma técnica que combina busca em base de conhecimento com geração de texto", "C) Um algoritmo de clustering", "D) Um tipo de rede neural recorrente"],
    correct: 1,
    explanation: "RAG combina recuperação de informações de uma base de conhecimento externa com a capacidade generativa do LLM, reduzindo alucinações e fornecendo respostas baseadas em dados atualizados."
  },
  {
    question: "Qual parâmetro de inferência controla a aleatoriedade/criatividade das respostas de um LLM?",
    options: ["A) Max tokens", "B) Top-k", "C) Temperature", "D) Stop sequences"],
    correct: 2,
    explanation: "Temperature controla a aleatoriedade: valores baixos (0.1) geram respostas mais determinísticas e focadas; valores altos (0.9) geram respostas mais criativas e variadas."
  },
  {
    question: "Uma empresa quer usar IA generativa mas precisa que as respostas sejam baseadas apenas em documentos internos. Qual abordagem é recomendada?",
    options: ["A) Aumentar a temperature do modelo", "B) Usar RAG com Knowledge Base no Bedrock", "C) Treinar um modelo do zero", "D) Usar zero-shot prompting"],
    correct: 1,
    explanation: "RAG com Knowledge Base no Amazon Bedrock permite que o modelo busque informações em documentos da empresa antes de gerar respostas, garantindo precisão e reduzindo alucinações."
  },
  {
    question: "O que são 'alucinações' em modelos de IA generativa?",
    options: ["A) Erros de processamento de GPU", "B) Respostas geradas que parecem corretas mas contêm informações falsas", "C) Problemas de latência na inferência", "D) Falhas de segurança no modelo"],
    correct: 1,
    explanation: "Alucinações ocorrem quando o modelo gera informações que parecem plausíveis mas são factualmente incorretas. RAG, guardrails e validação humana ajudam a mitigar esse problema."
  },
  {
    question: "Qual serviço AWS é usado para detectar viés (bias) em dados de treinamento e modelos de ML?",
    options: ["A) Amazon Macie", "B) Amazon Inspector", "C) Amazon SageMaker Clarify", "D) Amazon GuardDuty"],
    correct: 2,
    explanation: "SageMaker Clarify detecta viés em dados e modelos, fornecendo métricas de fairness e explicabilidade. Ajuda a garantir que modelos não discriminem grupos específicos."
  },
  {
    question: "Qual recurso do Amazon Bedrock permite definir filtros de conteúdo e tópicos proibidos nas respostas do modelo?",
    options: ["A) Bedrock Agents", "B) Bedrock Knowledge Bases", "C) Bedrock Guardrails", "D) Bedrock Fine-tuning"],
    correct: 2,
    explanation: "Bedrock Guardrails permite configurar filtros de conteúdo (violência, ódio, sexual), tópicos negados, filtros de PII e palavras bloqueadas para controlar as respostas do modelo."
  },
  {
    question: "No modelo de responsabilidade compartilhada para IA na AWS, qual é responsabilidade do CLIENTE?",
    options: ["A) Segurança física dos data centers", "B) Manutenção do hardware de GPUs", "C) Qualidade e governança dos dados de treinamento", "D) Patches do sistema operacional dos servidores Bedrock"],
    correct: 2,
    explanation: "No modelo compartilhado, o cliente é responsável pelos dados (qualidade, viés, governança, consentimento), configuração de acesso, e uso ético. A AWS cuida da infraestrutura."
  },
  {
    question: "Qual é a diferença principal entre fine-tuning e RAG?",
    options: ["A) Fine-tuning é mais barato que RAG", "B) RAG modifica os pesos do modelo, fine-tuning não", "C) Fine-tuning adapta o modelo com novos dados de treino; RAG busca informações em tempo real sem alterar o modelo", "D) Não há diferença, são sinônimos"],
    correct: 2,
    explanation: "Fine-tuning retreina o modelo com dados específicos (altera pesos). RAG mantém o modelo intacto e busca informações em uma base de conhecimento externa durante a inferência."
  },
  {
    question: "Qual métrica avalia a proporção de previsões positivas corretas em relação ao total de previsões positivas?",
    options: ["A) Recall", "B) Accuracy", "C) Precision", "D) F1-Score"],
    correct: 2,
    explanation: "Precision = TP / (TP + FP). Mede quantas das previsões positivas estavam realmente corretas. Importante quando falsos positivos têm alto custo (ex: diagnóstico médico)."
  },
  {
    question: "Uma empresa quer criar um chatbot que execute ações (consultar banco, enviar email) além de responder perguntas. Qual recurso do Bedrock é adequado?",
    options: ["A) Bedrock Knowledge Bases", "B) Bedrock Guardrails", "C) Bedrock Agents", "D) Bedrock Fine-tuning"],
    correct: 2,
    explanation: "Bedrock Agents permitem que o modelo execute ações via APIs externas (action groups), combinando raciocínio do LLM com execução de tarefas reais."
  },
  {
    question: "Qual conceito descreve a quantidade máxima de texto que um LLM pode processar em uma única interação?",
    options: ["A) Batch size", "B) Context window", "C) Embedding dimension", "D) Learning rate"],
    correct: 1,
    explanation: "Context window é o limite de tokens (entrada + saída) que o modelo pode processar por vez. Modelos maiores têm context windows maiores (ex: 200K tokens no Claude 3)."
  },
  {
    question: "Qual serviço AWS analisa texto para extrair sentimento, entidades e idioma automaticamente?",
    options: ["A) Amazon Transcribe", "B) Amazon Polly", "C) Amazon Comprehend", "D) Amazon Translate"],
    correct: 2,
    explanation: "Amazon Comprehend usa NLP para análise de sentimento, extração de entidades, detecção de idioma e modelagem de tópicos em texto."
  },
  {
    question: "O que é 'Human-in-the-Loop' no contexto de IA responsável?",
    options: ["A) Um algoritmo de aprendizado por reforço", "B) Revisão e validação humana em pontos críticos do processo de IA", "C) Um tipo de rede neural", "D) Uma técnica de data augmentation"],
    correct: 1,
    explanation: "Human-in-the-Loop envolve supervisão humana em decisões críticas da IA — revisão de outputs, validação de classificações e aprovação antes de ações automatizadas."
  },
  {
    question: "Qual serviço AWS converte texto em fala natural?",
    options: ["A) Amazon Transcribe", "B) Amazon Lex", "C) Amazon Polly", "D) Amazon Rekognition"],
    correct: 2,
    explanation: "Amazon Polly converte texto em fala (Text-to-Speech) com vozes naturais em múltiplos idiomas. Amazon Transcribe faz o inverso (Speech-to-Text)."
  },
  {
    question: "Uma empresa precisa garantir que dados sensíveis (CPF, email) não apareçam nas respostas do modelo. Qual recurso utilizar?",
    options: ["A) Amazon Macie", "B) Bedrock Guardrails com filtro de PII", "C) AWS WAF", "D) Amazon Inspector"],
    correct: 1,
    explanation: "Bedrock Guardrails oferece filtros de PII (Personally Identifiable Information) que detectam e mascaram dados sensíveis nas respostas do modelo automaticamente."
  },
  {
    question: "Qual serviço AWS usa visão computacional para análise de imagens e vídeos?",
    options: ["A) Amazon Comprehend", "B) Amazon Rekognition", "C) Amazon Textract", "D) Amazon Lookout for Vision"],
    correct: 1,
    explanation: "Amazon Rekognition detecta objetos, rostos, textos e cenas em imagens e vídeos. Textract extrai texto de documentos, Comprehend analisa texto, Lookout for Vision detecta anomalias visuais."
  },
  {
    question: "O que é um embedding no contexto de IA/ML?",
    options: ["A) Um tipo de camada de rede neural", "B) Representação numérica vetorial de dados (texto, imagem) que captura significado semântico", "C) Um método de compressão de dados", "D) Um algoritmo de clustering"],
    correct: 1,
    explanation: "Embeddings convertem dados (palavras, frases, imagens) em vetores numéricos onde itens semanticamente similares ficam próximos no espaço vetorial. Fundamentais para busca semântica e RAG."
  },
  {
    question: "Qual é a diferença entre Precision e Recall em modelos de classificação?",
    options: ["A) São a mesma métrica com nomes diferentes", "B) Precision mede acertos entre positivos previstos; Recall mede positivos reais encontrados", "C) Recall é sempre maior que Precision", "D) Precision é usada apenas para regressão"],
    correct: 1,
    explanation: "Precision = TP/(TP+FP): dos que o modelo disse positivo, quantos eram? Recall = TP/(TP+FN): dos positivos reais, quantos o modelo encontrou? F1-Score equilibra os dois."
  },
  {
    question: "Qual serviço AWS permite criar chatbots com processamento de linguagem natural?",
    options: ["A) Amazon Polly", "B) Amazon Transcribe", "C) Amazon Lex", "D) Amazon Connect"],
    correct: 2,
    explanation: "Amazon Lex usa NLU (Natural Language Understanding) para criar chatbots e assistentes virtuais. É o mesmo motor do Alexa. Polly é TTS, Transcribe é STT."
  },
  {
    question: "O que é overfitting em modelos de ML?",
    options: ["A) O modelo tem poucos parâmetros para aprender", "B) O modelo aprende demais os dados de treino e perde capacidade de generalizar para novos dados", "C) O modelo usa muita memória durante inferência", "D) O modelo tem alta latência"],
    correct: 1,
    explanation: "Overfitting ocorre quando o modelo memoriza os dados de treino (incluindo ruído) mas falha em dados novos. Soluções: mais dados, regularização, dropout, early stopping."
  },
  {
    question: "Qual é a função do Amazon SageMaker no ciclo de vida de ML?",
    options: ["A) Apenas hospedar modelos em produção", "B) Plataforma completa para preparar dados, treinar, avaliar e implantar modelos de ML", "C) Apenas criar datasets de treinamento", "D) Substituir o Amazon Bedrock"],
    correct: 1,
    explanation: "SageMaker é a plataforma end-to-end de ML da AWS: data labeling (Ground Truth), notebooks, treinamento distribuído, avaliação, registro de modelos e deploy em endpoints gerenciados."
  },
  {
    question: "O que é Chain-of-Thought prompting?",
    options: ["A) Encadear múltiplos modelos em sequência", "B) Técnica que pede ao modelo para mostrar o raciocínio passo a passo antes da resposta final", "C) Um tipo de fine-tuning", "D) Conectar prompts de diferentes usuários"],
    correct: 1,
    explanation: "Chain-of-Thought (CoT) instrui o modelo a 'pensar em voz alta' — mostrar os passos intermediários de raciocínio. Melhora significativamente a precisão em problemas matemáticos e lógicos."
  },
  {
    question: "Qual é o risco de viés (bias) em modelos de IA e como a AWS ajuda a mitigá-lo?",
    options: ["A) Viés é apenas um problema de performance; AWS não oferece ferramentas específicas", "B) Viés nos dados de treino pode gerar discriminação; SageMaker Clarify detecta e mede viés", "C) Viés só ocorre em modelos de linguagem, não em modelos de visão", "D) AWS elimina automaticamente todo viés nos modelos do Bedrock"],
    correct: 1,
    explanation: "Viés nos dados de treino pode fazer o modelo discriminar grupos. SageMaker Clarify mede métricas de fairness antes e depois do treino. Bedrock Guardrails ajuda a filtrar outputs tendenciosos."
  },
  {
    question: "Qual serviço AWS extrai texto, tabelas e formulários de documentos escaneados?",
    options: ["A) Amazon Comprehend", "B) Amazon Rekognition", "C) Amazon Textract", "D) Amazon Kendra"],
    correct: 2,
    explanation: "Amazon Textract usa ML para extrair texto estruturado de documentos (PDFs, imagens), incluindo tabelas e campos de formulários — além do simples OCR."
  },
  {
    question: "O que é Amazon Kendra?",
    options: ["A) Um serviço de tradução automática", "B) Um serviço de busca inteligente baseado em ML para documentos corporativos", "C) Um modelo de fundação da Amazon", "D) Um serviço de análise de sentimento"],
    correct: 1,
    explanation: "Amazon Kendra é um serviço de busca empresarial com ML que entende linguagem natural. Permite buscar em múltiplas fontes (S3, SharePoint, Salesforce) com respostas precisas."
  },
  {
    question: "Qual é a diferença entre IA Generativa e IA Discriminativa?",
    options: ["A) IA Generativa classifica dados; IA Discriminativa cria novos dados", "B) IA Generativa cria novos dados (texto, imagem); IA Discriminativa classifica/distingue entre categorias", "C) São termos sinônimos", "D) IA Discriminativa é mais recente que IA Generativa"],
    correct: 1,
    explanation: "IA Generativa (GPT, DALL-E, Stable Diffusion) cria novos conteúdos. IA Discriminativa (classificadores, detectores) aprende a distinguir entre categorias existentes."
  },
  {
    question: "O que é o conceito de 'grounding' em IA Generativa?",
    options: ["A) Processo de treinar o modelo do zero", "B) Técnica de conectar respostas do modelo a fontes de dados verificáveis para reduzir alucinações", "C) Método de compressão de modelos", "D) Processo de fine-tuning com RLHF"],
    correct: 1,
    explanation: "Grounding conecta as respostas do LLM a fontes de dados reais e verificáveis (via RAG, por exemplo), reduzindo alucinações e aumentando a confiabilidade das respostas."
  },
  {
    question: "Qual serviço AWS oferece busca semântica usando embeddings vetoriais?",
    options: ["A) Amazon OpenSearch Service com k-NN", "B) Amazon RDS", "C) Amazon DynamoDB", "D) Amazon Redshift"],
    correct: 0,
    explanation: "Amazon OpenSearch Service suporta busca k-NN (k-Nearest Neighbors) com vetores de embeddings, permitindo busca semântica por similaridade — componente essencial de sistemas RAG."
  },
  {
  question: "Uma operadora de cartão de crédito processa 500.000 transações por hora e precisa aprovar ou rejeitar cada transação em menos de 50 milissegundos para não impactar a experiência do cliente no ponto de venda. Qual tipo de inferência é obrigatório neste cenário?",
  options: [
    "A) Inferência manual por analistas humanos",
    "B) Inferência em batch executada a cada hora",
    "C) Inferência em tempo real com endpoint de baixa latência sempre disponível",
    "D) Inferência assíncrona com resposta em até 5 minutos"
  ],
  correct: 2,
  explanation: "Com requisito de 50ms por decisão em transações no ponto de venda, inferência em tempo real é obrigatória. O modelo precisa estar em um endpoint dedicado com auto-scaling para lidar com 500.000 transações/hora. Qualquer atraso resulta em timeout na maquininha e perda de venda."
  },
  {
    question: "Uma empresa agrícola usa drones para capturar imagens aéreas de plantações e quer identificar automaticamente áreas com pragas, deficiência nutricional ou estresse hídrico. Qual tipo de IA e serviço AWS são mais adequados?",
    options: [
      "A) Visão computacional com Amazon Rekognition Custom Labels ou modelo treinado no SageMaker",
      "B) Tradução com Amazon Translate",
      "C) Speech-to-text com Amazon Transcribe",
      "D) NLP com Amazon Comprehend"
    ],
    correct: 0,
    explanation: "Análise de imagens aéreas de plantações é um problema de visão computacional. Amazon Rekognition Custom Labels permite treinar modelos de detecção de objetos customizados com imagens específicas do domínio agrícola. Alternativamente, SageMaker permite treinar modelos mais sofisticados de segmentação de imagens para identificar áreas afetadas."
  },
  {
    question: "Uma empresa de streaming de música quer criar playlists personalizadas para 50 milhões de usuários. O sistema deve considerar histórico de reprodução, horário do dia, humor inferido e preferências de usuários similares. Qual técnica de ML é a base deste sistema?",
    options: [
      "A) Sistema de recomendação com filtragem colaborativa e baseada em conteúdo",
      "B) Regressão linear simples",
      "C) Detecção de anomalias",
      "D) Classificação binária"
    ],
    correct: 0,
    explanation: "Sistemas de recomendação combinam filtragem colaborativa (usuários com gostos similares ouvem músicas similares) com filtragem baseada em conteúdo (características das músicas como gênero, BPM, mood). Amazon Personalize é o serviço AWS que implementa essas técnicas de forma gerenciada para recomendações em escala."
  },
  {
    question: "Uma rede de farmácias quer prever a demanda de medicamentos para cada loja nas próximas 2 semanas, considerando sazonalidade (gripes no inverno), feriados e tendências locais. O modelo será retreinado semanalmente com dados atualizados. Qual etapa do pipeline de ML garante que o retreinamento seja consistente e auditável?",
    options: [
      "A) Treinar apenas uma vez e nunca atualizar",
      "B) Fazer tudo manualmente em notebooks Jupyter",
      "C) Implementar pipelines automatizados de MLOps com versionamento de dados, código e modelos",
      "D) Usar apenas regras de negócio fixas"
    ],
    correct: 2,
    explanation: "Pipelines automatizados de MLOps garantem que cada retreinamento semanal seja reproduzível e auditável: dados versionados, código versionado, modelo versionado e métricas registradas. Amazon SageMaker Pipelines automatiza esse fluxo."
  },
  {
    question: "Uma empresa de telecomunicações tem 10 milhões de clientes e quer prever quais têm maior probabilidade de cancelar o plano nos próximos 30 dias. O dataset histórico tem 200 features e rótulos de churn. Qual etapa do pipeline pode melhorar a performance do modelo reduzindo ruído?",
    options: [
      "A) Remover todos os dados e começar do zero",
      "B) Usar todas as 200 features sem análise",
      "C) Aumentar o número de epochs indefinidamente",
      "D) Feature engineering e seleção de features"
    ],
    correct: 3,
    explanation: "Feature engineering e feature selection melhoram a performance reduzindo ruído e dimensionalidade. Nem todas as features são úteis; algumas podem ser redundantes ou adicionar ruído ao modelo."
  },
  {
    question: "Uma empresa de delivery de comida quer estimar o tempo de entrega para cada pedido considerando distância, trânsito atual, tempo de preparo e clima. O output é um valor em minutos. Qual tipo de modelo e métrica são mais adequados?",
    options: [
      "A) Clustering com silhouette score",
      "B) Regressão com MAE ou RMSE",
      "C) Classificação com F1 Score",
      "D) Detecção de anomalias com precision"
    ],
    correct: 1,
    explanation: "Prever tempo em minutos é um problema de regressão. MAE mede o erro médio absoluto e RMSE penaliza mais os erros grandes."
  },
  {
    question: "Uma empresa de manufatura automotiva implementou visão computacional para inspecionar peças na linha de produção. O modelo detecta defeitos com 98% de recall mas apenas 70% de precision. O que deve ser priorizado?",
    options: [
      "A) Melhorar a precision para reduzir falsos positivos, mantendo recall aceitável",
      "B) Ignorar os alarmes falsos",
      "C) Aumentar o recall para 100%",
      "D) Remover o modelo e voltar à inspeção manual"
    ],
    correct: 0,
    explanation: "Com 70% de precision, 30% dos alertas são falsos positivos, causando paradas desnecessárias. Melhorar precision reduz esse impacto."
  },
  {
    question: "Uma empresa de seguros de automóveis quer usar fotos de acidentes enviadas por clientes para estimar automaticamente o custo do reparo. Qual combinação de técnicas de IA é necessária?",
    options: [
      "A) Apenas NLP",
      "B) Apenas clustering",
      "C) Visão computacional para analisar danos + regressão para estimar custos",
      "D) Apenas tradução automática"
    ],
    correct: 2,
    explanation: "O processo exige visão computacional para identificar danos e regressão para estimar os custos de reparo com base nesses danos."
  },
  {
    question: "Uma empresa de RH quer analisar 5.000 avaliações de desempenho escritas por gestores para identificar padrões de linguagem que correlacionam com promoções futuras. Qual abordagem inicial é mais adequada?",
    options: [
      "A) NLP exploratório com topic modeling e análise de sentimento",
      "B) Regressão linear",
      "C) Visão computacional",
      "D) Classificação supervisionada imediata"
    ],
    correct: 0,
    explanation: "Com texto livre sem categorias definidas, a melhor abordagem inicial é explorar os dados usando NLP para descobrir padrões antes de criar modelos preditivos."
  },
  {
    question: "Uma empresa de logística treinou um modelo para otimizar rotas de entrega. O modelo funciona bem em São Paulo, mas mal no Rio de Janeiro. Qual conceito explica essa diferença?",
    options: [
      "A) O hardware é insuficiente",
      "B) O modelo não generaliza bem para dados com distribuição diferente dos dados de treinamento",
      "C) O modelo é muito rápido",
      "D) O modelo é muito grande"
    ],
    correct: 1,
    explanation: "Distribution shift ocorre quando os dados de produção possuem características diferentes dos dados utilizados durante o treinamento."
  },
  {
    question: "Uma empresa de e-commerce quer A/B testar dois modelos de recomendação e medir qual gera mais receita por usuário. Qual métrica de negócio é mais relevante?",
    options: [
      "A) Número de parâmetros do modelo",
      "B) Tempo de treinamento",
      "C) Average Revenue Per User (ARPU) e taxa de conversão",
      "D) Accuracy do modelo"
    ],
    correct: 2,
    explanation: "O objetivo de negócio é aumentar receita. ARPU e taxa de conversão medem diretamente o impacto financeiro das recomendações."
  },
  {
    question: "Uma empresa de mídia social processa 1 bilhão de posts por dia e precisa classificar conteúdo em categorias. Qual conceito de MLOps é mais crítico?",
    options: [
      "A) Reuniões semanais de equipe",
      "B) Documentação manual",
      "C) Testes manuais",
      "D) Infraestrutura escalável que suporte classificação e retreinamento em larga escala"
    ],
    correct: 3,
    explanation: "Com bilhões de classificações e retreinamento diário, a infraestrutura precisa escalar automaticamente para suportar a carga."
  },
  {
    question: "Uma startup de fintech quer lançar um produto de scoring de crédito usando ML. O investidor pergunta quanto custa manter o modelo em produção por mês. O que deve ser considerado?",
    options: [
      "A) Apenas o salário dos cientistas de dados",
      "B) Apenas o custo do treinamento inicial",
      "C) Inferência, armazenamento, monitoramento, retreinamento e manutenção",
      "D) Apenas o custo do Amazon S3"
    ],
    correct: 2,
    explanation: "O custo total inclui endpoints de inferência, armazenamento, monitoramento, retreinamento periódico e equipe de manutenção."
  },
  {
    question: "Uma empresa de advocacia com 200 advogados quer implementar um assistente de IA que responda perguntas sobre legislação brasileira usando 2 milhões de páginas de documentos. Qual arquitetura AWS atende aos requisitos de confidencialidade?",
    options: [
      "A) Enviar todos os documentos para a OpenAI por email",
      "B) Amazon Bedrock com Knowledge Bases (RAG) indexando documentos em S3",
      "C) Usar ChatGPT público e colar documentos no chat",
      "D) Imprimir os documentos e contratar mais advogados"
    ],
    correct: 1,
    explanation: "Bedrock Knowledge Bases implementa RAG de forma gerenciada e garante que os dados não sejam usados para treinamento dos modelos."
  },
  {
    question: "Uma empresa de games mobile quer usar IA generativa para criar diálogos únicos para 500 NPCs em um RPG. Qual abordagem é mais escalável sem fine-tuning individual?",
    options: [
      "A) Treinar 500 modelos separados",
      "B) Usar o mesmo diálogo para todos os NPCs",
      "C) Escrever manualmente todos os diálogos",
      "D) Usar system prompts específicos para cada NPC"
    ],
    correct: 3,
    explanation: "System prompts permitem definir personalidade, estilo e conhecimento de cada NPC sem necessidade de treinar modelos separados."
  },
  {
    question: "Uma empresa de notícias quer gerar automaticamente títulos para artigos. Usa um modelo preciso para notícias factuais e outro mais criativo para entretenimento. Qual conceito está sendo aplicado?",
    options: [
      "A) Fine-tuning",
      "B) Prompt routing",
      "C) Clustering",
      "D) RAG"
    ],
    correct: 1,
    explanation: "Prompt routing direciona diferentes tipos de tarefas para modelos diferentes conforme os requisitos de qualidade e criatividade."
  },
  {
    question: "Uma empresa de contabilidade quer usar IA generativa para responder perguntas sobre legislação tributária que muda frequentemente. Qual limitação dos LLMs é mais problemática?",
    options: [
      "A) Knowledge cutoff",
      "B) O modelo não processa números",
      "C) O modelo é muito caro",
      "D) O modelo é muito lento"
    ],
    correct: 0,
    explanation: "LLMs não conhecem fatos publicados após seu treinamento. Para legislação atualizada, RAG é fundamental."
  },
  {
    question: "Uma empresa de arquitetura quer gerar renderizações 3D a partir de plantas baixas e descrições textuais. Qual tipo de modelo é necessário?",
    options: [
      "A) Modelo de tradução",
      "B) Modelo multimodal que recebe imagem e texto e gera imagem",
      "C) Modelo de classificação de texto",
      "D) Modelo de análise de sentimento"
    ],
    correct: 1,
    explanation: "O cenário exige um modelo multimodal capaz de interpretar tanto a planta quanto a descrição textual e produzir uma imagem."
  },
  {
    question: "Uma empresa de SaaS quer criar uma busca inteligente para documentação técnica onde usuários fazem perguntas em linguagem natural. Qual tecnologia resolve melhor esse problema?",
    options: [
      "A) Busca por regex",
      "B) Busca semântica usando embeddings vetoriais",
      "C) Busca por keyword usando SQL LIKE",
      "D) Índice full-text simples"
    ],
    correct: 1,
    explanation: "Embeddings permitem encontrar documentos semanticamente relacionados mesmo quando as palavras utilizadas são diferentes."
  },
  {
    question: "Uma empresa de consultoria cobra R$500 por hora de consultores seniores e implementou um assistente de IA que economiza 2 horas por consultor por dia para 50 consultores. Qual métrica demonstra o valor de negócio?",
    options: [
      "A) Economia de R$50.000 por dia em tempo de consultores",
      "B) Número de parâmetros do modelo",
      "C) Número de tokens processados",
      "D) Tamanho do modelo em GB"
    ],
    correct: 0,
    explanation: "O impacto financeiro direto é a principal métrica de valor para o negócio, representando economia e aumento de produtividade."
  },
  {
    question: "Uma empresa de varejo quer usar IA generativa para gerar emails de marketing personalizados para 5 milhões de clientes. Cada email deve mencionar produtos relevantes ao histórico do cliente. O volume é alto mas não precisa ser em tempo real. Qual modelo de uso do Bedrock é mais econômico?",
    options: [
      "A) Provisioned Throughput 24/7",
      "B) Batch inference - processar todos os emails em lote durante horário de menor demanda",
      "C) Criar um endpoint dedicado permanente",
      "D) Chamadas on-demand em tempo real para cada cliente"
    ],
    correct: 1,
    explanation: "Para milhões de gerações que não exigem resposta imediata, batch inference é a opção mais econômica. O Bedrock permite processar grandes volumes com custo reduzido em comparação ao processamento individual."
  },
  {
    question: "Uma empresa de educação online quer criar um sistema que gere questões de prova automaticamente a partir do conteúdo das aulas. Qual técnica de prompt engineering garante o formato consistente das questões?",
    options: [
      "A) Few-shot prompting com exemplos completos e estrutura explícita",
      "B) Apenas aumentar temperature",
      "C) Usar o modelo sem instruções",
      "D) Zero-shot com 'gere uma questão'"
    ],
    correct: 0,
    explanation: "Few-shot prompting demonstra ao modelo exatamente o formato desejado. Isso aumenta significativamente a consistência das respostas geradas."
  },
  {
    question: "Uma empresa de seguros quer usar IA generativa mas o CTO está preocupado com custos imprevisíveis. Qual estratégia reduz custos sem sacrificar qualidade?",
    options: [
      "A) Enviar documentos completos em toda consulta",
      "B) Usar sempre o modelo mais caro disponível",
      "C) Implementar prompt caching, chunking otimizado e prompt routing",
      "D) Parar de usar IA generativa"
    ],
    correct: 2,
    explanation: "Prompt caching, recuperação apenas de contexto relevante e uso de modelos menores para tarefas simples podem reduzir custos drasticamente."
  },
  {
    question: "Uma empresa de recrutamento tech quer usar Amazon Q Developer com repositórios privados contendo lógica proprietária. Qual preocupação de segurança é mais relevante?",
    options: [
      "A) Garantir que o código proprietário não seja usado para treinar modelos públicos",
      "B) O modelo gerar código em linguagem errada",
      "C) O custo da solução",
      "D) A velocidade do modelo"
    ],
    correct: 0,
    explanation: "A principal preocupação é proteger propriedade intelectual e garantir que dados privados permaneçam confidenciais."
  },
  {
    question: "Uma empresa de telecomunicações quer criar um chatbot que atenda clientes em português, espanhol e inglês simultaneamente. Qual capacidade do FM é essencial?",
    options: [
      "A) Capacidade de gerar vídeo",
      "B) Capacidade de processar áudio",
      "C) Capacidade multilingual nativa",
      "D) Capacidade de gerar imagens"
    ],
    correct: 2,
    explanation: "Modelos multilíngues conseguem entender e responder em vários idiomas sem necessidade de tradução intermediária."
  },
  {
    question: "Uma empresa de energia renovável quer usar IA generativa para gerar relatórios técnicos baseados em dados de sensores. Qual risco é mais crítico?",
    options: [
      "A) O relatório ficar muito longo",
      "B) O relatório sair em idioma incorreto",
      "C) O modelo ser muito lento",
      "D) Alucinação de dados numéricos"
    ],
    correct: 3,
    explanation: "LLMs podem inventar números. A mitigação consiste em fornecer dados reais como contexto e restringir o modelo a utilizá-los."
  },
  {
    question: "Uma empresa de moda quer usar IA generativa para criar descrições de roupas com o tom jovem da marca. Sem fine-tuning, qual abordagem resolve?",
    options: [
      "A) Refinar o system prompt com exemplos e estilo da marca",
      "B) Trocar completamente de modelo",
      "C) Reduzir temperature para zero",
      "D) Aumentar max tokens"
    ],
    correct: 0,
    explanation: "O system prompt é a maneira mais rápida e econômica de adaptar o comportamento do modelo ao tom desejado."
  },
  {
    question: "Uma empresa de logística quer que seu assistente de IA responda 'Não sei' quando não houver informação suficiente. Qual técnica implementa esse comportamento?",
    options: [
      "A) Remover o system prompt",
      "B) Aumentar temperature",
      "C) Incluir instrução explícita para admitir ausência de informação",
      "D) Usar max tokens igual a 1"
    ],
    correct: 2,
    explanation: "Instruções explícitas para admitir incerteza reduzem significativamente alucinações."
  },
  {
    question: "Uma empresa de pesquisa de mercado quer analisar 100.000 reviews de concorrentes para identificar pontos fortes e fracos. Qual serviço AWS é mais adequado?",
    options: [
      "A) Amazon Translate",
      "B) Amazon Polly",
      "C) Leitura manual das avaliações",
      "D) Amazon Comprehend para análise de sentimento e tópicos"
    ],
    correct: 3,
    explanation: "Amazon Comprehend realiza análise de sentimento, extração de entidades e identificação de tópicos em larga escala."
  },
  {
    question: "Uma empresa de compliance bancário implementou RAG mas o sistema mistura trechos de diferentes resoluções regulatórias. Qual ajuste resolve o problema?",
    options: [
      "A) Implementar metadata filtering antes da busca vetorial",
      "B) Aumentar temperature",
      "C) Remover documentos do vector store",
      "D) Usar um modelo maior"
    ],
    correct: 0,
    explanation: "Metadata filtering restringe a busca aos documentos corretos antes da recuperação semântica, evitando contaminação de contexto."
  }, 
  {
    question: "Uma empresa de e-commerce quer que seu agente de IA possa verificar estoque em tempo real, aplicar cupons de desconto, calcular frete e finalizar pedidos. Qual arquitetura AWS implementa isso?",
    options: [
      "A) Amazon Polly",
      "B) Amazon Bedrock Agents com Action Groups conectados a Lambda functions",
      "C) Amazon Translate",
      "D) Amazon Comprehend apenas"
    ],
    correct: 1,
    explanation: "Amazon Bedrock Agents orquestra tarefas multi-etapas. Cada Action Group define uma capacidade, como verificar estoque, aplicar cupom, calcular frete ou finalizar pedido, normalmente conectado a uma Lambda function ou API."
  },
  {
    question: "Uma empresa de saúde implementou RAG para que médicos consultem protocolos clínicos. O sistema deve retornar apenas informações oficiais e nunca inventar dosagens. Qual configuração é mais segura?",
    options: [
      "A) Sem RAG, confiar na memória do modelo",
      "B) Temperature = 1.0 sem restrições",
      "C) Temperature = 0 + RAG com protocolos oficiais + instrução para responder apenas com base nos documentos",
      "D) Temperature alta para respostas criativas"
    ],
    correct: 2,
    explanation: "Em contexto médico, a configuração mais segura combina baixa aleatoriedade, RAG com fontes oficiais e instrução explícita para não inventar informações quando os documentos não trouxerem a resposta."
  },
  {
    question: "Uma empresa de mídia quer gerar legendas automáticas para vídeos em 10 idiomas. O pipeline precisa transcrever áudio, traduzir e manter timestamps. Qual pipeline AWS é mais adequado?",
    options: [
      "A) Amazon Rekognition → Amazon Comprehend",
      "B) Amazon Transcribe com timestamps → Amazon Translate",
      "C) Amazon Polly → Amazon Lex",
      "D) Amazon Bedrock apenas"
    ],
    correct: 1,
    explanation: "Amazon Transcribe converte áudio em texto com timestamps. Amazon Translate traduz o conteúdo para outros idiomas, preservando a estrutura necessária para sincronização das legendas."
  },
  {
    question: "Uma empresa de suporte técnico quer que o chatbot escale automaticamente para humano quando houver frustração extrema, dados financeiros sensíveis ou falha após várias tentativas. Qual recurso ajuda a implementar essas regras?",
    options: [
      "A) Aumentar o context window",
      "B) Trocar o modelo",
      "C) Reduzir temperature",
      "D) Amazon Bedrock Guardrails combinado com lógica de aplicação"
    ],
    correct: 3,
    explanation: "Bedrock Guardrails pode detectar ou bloquear conteúdos sensíveis e inadequados. A lógica de aplicação complementa esse controle, por exemplo contando tentativas e acionando escalonamento humano."
  },
  {
    question: "Uma empresa de pesquisa acadêmica quer usar IA generativa para encontrar papers relevantes e gerar revisões de literatura sempre citando título, autor e ano. Qual técnica garante citações verificáveis?",
    options: [
      "A) RAG com base indexada de papers e metadados nos chunks",
      "B) Confiar na memória do modelo",
      "C) Usar zero-shot sem contexto",
      "D) Aumentar temperature para criatividade"
    ],
    correct: 0,
    explanation: "RAG permite recuperar papers reais da base indexada. Ao incluir metadados como título, autor e ano nos chunks, o modelo pode citar fontes verificáveis."
  },
  {
    question: "Uma empresa de contabilidade quer que o modelo extraia dados de notas fiscais e gere lançamentos contábeis no formato exato do ERP. O modelo acerta 95%, mas 5% de erros causam problemas. Qual abordagem resolve melhor?",
    options: [
      "A) Usar um modelo maior sem validação",
      "B) Aceitar os 5% de erro",
      "C) Instruction tuning com exemplos do formato exato + validação automatizada do output",
      "D) Aumentar temperature"
    ],
    correct: 2,
    explanation: "Para formatos rígidos, instruction tuning ajuda o modelo a aprender o padrão esperado. A validação automatizada captura erros restantes antes que o resultado seja enviado ao ERP."
  },
  {
    question: "Uma empresa de viagens quer que seu assistente de IA sugira roteiros considerando orçamento, preferências, datas, restrições alimentares e mobilidade reduzida. Qual técnica organiza melhor essas variáveis?",
    options: [
      "A) Não incluir preferências do cliente",
      "B) Prompt template estruturado com seções claras e system prompt definindo o papel do assistente",
      "C) Enviar todas as informações em texto corrido sem estrutura",
      "D) Usar apenas zero-shot"
    ],
    correct: 1,
    explanation: "Prompt templates estruturados organizam variáveis importantes em seções claras, ajudando o modelo a considerar todos os requisitos do usuário."
  },
  {
    question: "Uma empresa de seguros quer avaliar a qualidade das respostas do chatbot. Possui 1.000 perguntas com respostas ideais escritas por especialistas. Qual combinação de métricas é mais adequada?",
    options: [
      "A) Apenas medir latência",
      "B) Apenas contar tokens",
      "C) Apenas contar o número de palavras",
      "D) ROUGE + BERTScore + avaliação humana"
    ],
    correct: 3,
    explanation: "ROUGE mede sobreposição com a resposta ideal, BERTScore mede similaridade semântica e avaliação humana captura qualidade, utilidade, completude e tom."
  },
  {
    question: "Uma empresa imobiliária quer que seu agente de IA busque imóveis, agende visitas, envie propostas e consulte financiamento. Qual é o papel da orchestration no Amazon Bedrock Agents?",
    options: [
      "A) Criptografar dados",
      "B) O FM planeja quais Action Groups chamar, em qual ordem, interpreta resultados e decide próximos passos",
      "C) Monitorar custos",
      "D) Armazenar dados"
    ],
    correct: 1,
    explanation: "A orchestration é o processo em que o foundation model planeja e executa a sequência de ações necessárias para completar a tarefa do usuário."
  },
  {
    question: "Uma empresa de educação corporativa quer medir se seu assistente de IA está realmente ajudando funcionários a aprender. Qual métrica de negócio é mais relevante?",
    options: [
      "A) Número de tokens gerados por dia",
      "B) Tamanho do context window usado",
      "C) Melhoria nas avaliações pós-treinamento e redução no tempo para certificações",
      "D) Custo por query"
    ],
    correct: 2,
    explanation: "O objetivo é aprendizado. Métricas como melhoria nas avaliações e redução no tempo para certificação mostram impacto real no desenvolvimento dos funcionários."
  },
  {
    question: "Uma empresa de telecomunicações fez fine-tuning de um modelo para atendimento técnico. O modelo resolve problemas técnicos corretamente, mas inventa informações quando perguntado sobre planos e preços. Qual solução é mais adequada?",
    options: [
      "A) Aumentar temperature",
      "B) Fazer novo fine-tuning apenas com dados técnicos",
      "C) Implementar prompt routing: suporte técnico para o modelo fine-tuned e planos/preços para RAG com dados atualizados",
      "D) Desabilitar perguntas sobre preços"
    ],
    correct: 2,
    explanation: "Prompt routing direciona cada tipo de consulta para a solução mais adequada. O modelo fine-tuned atende suporte técnico, enquanto RAG fornece informações atualizadas sobre planos e preços."
  },
  {
    question: "Uma empresa de auditoria quer usar IA generativa para comparar demonstrações financeiras de diferentes períodos. Os números precisam ser 100% precisos. Qual abordagem é mais segura?",
    options: [
      "A) Usar temperature alta para análises criativas",
      "B) Fornecer dados financeiros exatos como contexto estruturado e exigir validação humana",
      "C) Confiar totalmente no modelo sem revisão",
      "D) Pedir ao modelo para lembrar os números das demonstrações"
    ],
    correct: 1,
    explanation: "Em cenários financeiros, os dados devem ser fornecidos explicitamente ao modelo e os resultados precisam passar por validação humana antes do uso."
  },
  {
    question: "Uma empresa quer implementar RAG para seu help desk interno. Os documentos incluem manuais técnicos extensos, FAQs e tickets resolvidos. Qual estratégia de chunking é mais adequada?",
    options: [
      "A) Não fazer chunking",
      "B) Chunks de 10 palavras para todos os documentos",
      "C) Usar o mesmo tamanho de chunk para todos os documentos",
      "D) Chunking adaptativo conforme o tipo de documento"
    ],
    correct: 3,
    explanation: "Diferentes tipos de documentos exigem estratégias diferentes. FAQs podem ser divididas por pergunta e resposta, enquanto manuais técnicos precisam de chunks maiores para preservar contexto."
  },
  {
    question: "Uma empresa de fintech quer que seu modelo gere explicações estruturadas sobre transações suspeitas. Qual técnica garante um output consistente?",
    options: [
      "A) Few-shot prompting com exemplos completos + JSON schema + instrução explícita",
      "B) Usar apenas zero-shot",
      "C) Temperature = 1.0 sem estrutura",
      "D) Pedir apenas para analisar a transação"
    ],
    correct: 0,
    explanation: "Few-shot prompting combinado com schema JSON fornece um formato consistente e validável para integração com sistemas corporativos."
  },
  {
    question: "Uma empresa de varejo implementou um assistente de IA para vendedores em lojas físicas. O assistente precisa responder em menos de 2 segundos, mas o modelo atual leva 5 segundos. Qual trade-off deve ser considerado?",
    options: [
      "A) Remover o assistente",
      "B) Pedir ao cliente para esperar mais",
      "C) Utilizar um modelo menor e mais rápido, aceitando pequena redução na qualidade",
      "D) Não existe solução"
    ],
    correct: 2,
    explanation: "Em aplicações interativas, a latência é crítica. Muitas vezes um modelo menor oferece qualidade suficiente com tempo de resposta muito melhor."
  },
  {
    question: "Uma empresa de logística criou um dataset de avaliação para seu sistema RAG e descobriu que 10% das respostas estão incorretas. Qual deve ser o próximo passo?",
    options: [
      "A) Analisar se o problema está no retrieval ou na geração da resposta",
      "B) Trocar todo o sistema",
      "C) Adicionar documentos aleatórios",
      "D) Aumentar temperature"
    ],
    correct: 0,
    explanation: "O primeiro passo é identificar a causa do erro. Pode ser uma recuperação inadequada de documentos ou uma interpretação incorreta do contexto pelo modelo."
  },
  {
    question: "Uma empresa de healthcare quer que seu assistente ajude médicos a preencher prontuários eletrônicos com base em consultas gravadas. Qual pipeline é mais adequado?",
    options: [
      "A) Amazon Translate → Amazon Comprehend",
      "B) Amazon Polly → Amazon S3",
      "C) Amazon Bedrock apenas",
      "D) Amazon Transcribe Medical → Amazon Bedrock → Revisão obrigatória do médico"
    ],
    correct: 3,
    explanation: "O áudio é convertido em texto com terminologia médica especializada, depois estruturado pelo LLM e finalmente validado pelo médico."
  },
  {
    question: "Uma empresa de delivery descobriu que seu algoritmo atribui entregas menos lucrativas para entregadores de bairros periféricos. Qual problema de IA responsável está presente?",
    options: [
      "A) O sistema está otimizado corretamente",
      "B) O modelo é muito lento",
      "C) Viés algorítmico que perpetua desigualdade socioeconômica",
      "D) O modelo é muito complexo"
    ],
    correct: 2,
    explanation: "O algoritmo está reproduzindo ou amplificando desigualdades existentes, gerando impactos negativos para determinados grupos."
  },
  {
    question: "Uma empresa de crédito imobiliário utiliza uma rede neural profunda para aprovar financiamentos. O regulador exige explicações claras para negativas. Qual dilema está presente?",
    options: [
      "A) Trade-off entre explicabilidade e performance",
      "B) O modelo é muito barato",
      "C) O modelo é muito rápido",
      "D) O modelo é muito preciso"
    ],
    correct: 0,
    explanation: "Modelos mais complexos costumam oferecer maior precisão, mas são mais difíceis de explicar. Esse é um dos principais desafios da IA responsável."
  },
  {
    question: "Uma empresa de saúde mental lançou um chatbot de apoio emocional que começou a fornecer conselhos terapêuticos específicos para pacientes com depressão severa. Qual princípio foi violado?",
    options: [
      "A) Performance",
      "B) Eficiência",
      "C) Safety e definição adequada de escopo",
      "D) Custo"
    ],
    correct: 2,
    explanation: "O chatbot ultrapassou os limites seguros de atuação. Sistemas desse tipo devem apoiar o usuário e encaminhar para profissionais quando necessário."
  },
  {
    question: "Uma empresa de e-commerce usa IA generativa para criar descrições de produtos. Um cliente descobriu que a IA gerou uma descrição muito semelhante ao conteúdo de um concorrente. Qual risco legal se materializou?",
    options: [
      "A) Violação de propriedade intelectual e direitos autorais",
      "B) Risco de performance",
      "C) Risco de latência",
      "D) Risco de custo"
    ],
    correct: 0,
    explanation: "O modelo reproduziu conteúdo protegido por direitos autorais. Isso pode gerar processos por violação de propriedade intelectual e exige mecanismos de validação e governança."
  },
  {
    question: "Uma empresa de RH implementou IA para analisar vídeos de entrevistas utilizando expressões faciais e tom de voz. Grupos de defesa alertaram sobre possível discriminação de pessoas com deficiência. Qual ação é necessária?",
    options: [
      "A) Usar um modelo maior",
      "B) Ignorar os alertas",
      "C) Realizar avaliação de impacto, criar acomodações e remover recursos injustos quando necessário",
      "D) Aumentar o dataset sem curadoria"
    ],
    correct: 2,
    explanation: "IA responsável exige avaliar impactos em grupos vulneráveis, criar alternativas inclusivas e remover funcionalidades que não possam ser tornadas justas."
  },
  {
    question: "Uma empresa quer implementar AI Safety em um sistema que gera conteúdo educacional para crianças. Qual medida é mais importante?",
    options: [
      "A) Utilizar o modelo mais barato",
      "B) Reduzir custos operacionais",
      "C) Aumentar velocidade de resposta",
      "D) Implementar guardrails rigorosos para bloquear conteúdo inadequado"
    ],
    correct: 3,
    explanation: "Para aplicações voltadas a crianças, filtros de conteúdo e guardrails são essenciais para impedir geração de material inadequado."
  },
  {
    question: "Uma seguradora utiliza histórico de exercícios físicos para calcular preços de planos de saúde. Como essa variável está altamente correlacionada com renda, pessoas de baixa renda acabam pagando mais. Qual conceito está presente?",
    options: [
      "A) Proxy discrimination",
      "B) O modelo está correto",
      "C) O modelo é muito simples",
      "D) O modelo é muito complexo"
    ],
    correct: 0,
    explanation: "Uma variável aparentemente neutra está funcionando como substituta indireta de uma característica sensível, causando discriminação."
  },
  {
    question: "Uma empresa quer garantir que seu modelo generativo seja robusto. Durante os testes, pequenas alterações como um espaço extra mudam completamente a resposta. Qual problema foi identificado?",
    options: [
      "A) O modelo é muito caro",
      "B) O modelo é muito rápido",
      "C) Sensibilidade excessiva a pequenas perturbações no input",
      "D) O modelo é muito grande"
    ],
    correct: 2,
    explanation: "Robustez significa produzir resultados consistentes para entradas semanticamente equivalentes. Pequenas alterações não deveriam causar mudanças drásticas."
  },
  {
    question: "Uma empresa implementou IA generativa e deseja criar um processo formal de governança. Todo novo caso de uso deve passar por uma avaliação de risco antes do deploy. Qual framework AWS pode ajudar?",
    options: [
      "A) AWS Migration Hub",
      "B) AWS Pricing Calculator",
      "C) AWS Well-Architected apenas",
      "D) Generative AI Security Scoping Matrix"
    ],
    correct: 3,
    explanation: "A Security Scoping Matrix auxilia na classificação de riscos e definição de controles de segurança adequados para aplicações de IA generativa."
  },
  {
    question: "Uma empresa de healthcare utiliza Amazon Bedrock para processar dados de pacientes. Uma auditoria descobriu PHI em logs de invocação. Qual combinação de medidas corrige a vulnerabilidade?",
    options: [
      "A) Desabilitar logs completamente",
      "B) Criptografar logs com KMS, restringir acesso via IAM e aplicar retenção adequada",
      "C) Mover logs para conta pessoal",
      "D) Deletar todos os logs"
    ],
    correct: 1,
    explanation: "Logs contendo PHI devem ser protegidos com criptografia, controles de acesso rígidos e retenção compatível com requisitos regulatórios."
  },
  {
    question: "Uma multinacional quer garantir que funcionários não utilizem Amazon Bedrock em regiões não autorizadas. Qual mecanismo AWS implementa essa restrição?",
    options: [
      "A) Route Tables",
      "B) Network ACLs",
      "C) AWS Organizations SCPs",
      "D) Security Groups"
    ],
    correct: 2,
    explanation: "Service Control Policies (SCPs) permitem aplicar restrições organizacionais que não podem ser ignoradas por contas ou usuários."
  },
  {
    question: "Uma fintech sofreu um ataque de prompt injection e o chatbot revelou informações de outros clientes. Qual camada de segurança estava ausente?",
    options: [
      "A) Separação entre autenticação/autorização e camada de IA",
      "B) O modelo era muito caro",
      "C) O modelo era muito lento",
      "D) O modelo era muito pequeno"
    ],
    correct: 0,
    explanation: "Mesmo que ocorra prompt injection, controles de autorização devem impedir acesso a dados que não pertencem ao usuário autenticado."
  },
  {
    question: "Uma empresa quer implementar defense in depth para uma aplicação de IA financeira. Qual sequência representa a abordagem mais completa?",
    options: [
      "A) Apenas IAM",
      "B) Apenas criptografia",
      "C) Apenas firewall",
      "D) WAF → IAM → PrivateLink → Guardrails → KMS → CloudTrail → Macie"
    ],
    correct: 3,
    explanation: "Defense in depth utiliza múltiplas camadas independentes de proteção para reduzir riscos mesmo quando uma camada falha."
  },
  {
    question: "Uma empresa deseja rastrear exatamente quais dados foram utilizados para treinar cada versão de um modelo. Qual conceito está sendo implementado?",
    options: [
      "A) Data deletion",
      "B) Data duplication",
      "C) Data lineage e catalogação de dados",
      "D) Data compression"
    ],
    correct: 2,
    explanation: "Data lineage permite rastrear origem, transformações e utilização dos dados ao longo de todo o ciclo de vida."
  },
  {
    question: "Um ex-consultor terceirizado ainda possui acesso aos endpoints do SageMaker três meses após o término do contrato. Qual falha ocorreu?",
    options: [
      "A) Falha no processo de offboarding",
      "B) Região incorreta",
      "C) Modelo muito caro",
      "D) Modelo muito grande"
    ],
    correct: 0,
    explanation: "A revogação de acessos deve fazer parte do processo de desligamento. Auditorias periódicas ajudam a identificar permissões indevidas."
  },
  {
    question: "Uma empresa de saúde precisa garantir conformidade com HIPAA. Qual serviço AWS fornece acesso ao Business Associate Agreement (BAA)?",
    options: [
      "A) Amazon S3",
      "B) AWS Artifact",
      "C) AWS Lambda",
      "D) Amazon CloudWatch"
    ],
    correct: 1,
    explanation: "AWS Artifact permite revisar e aceitar acordos de conformidade, incluindo o BAA necessário para workloads HIPAA."
  },
  {
    question: "O CISO quer monitorar quem usa modelos de IA, quais prompts são enviados e detectar tentativas de prompt injection. Qual stack atende esse requisito?",
    options: [
      "A) Apenas logs locais",
      "B) Apenas Amazon S3",
      "C) CloudTrail + Model Invocation Logging + CloudWatch + Guardrails",
      "D) Apenas relatórios semanais por email"
    ],
    correct: 2,
    explanation: "Essa combinação oferece auditoria, monitoramento operacional, visibilidade de uso e proteção contra ataques."
  },
  {
    question: "Uma empresa global opera em diversos países com regulamentações diferentes para IA. Qual estratégia de governança é mais adequada?",
    options: [
      "A) Ignorar regulamentações locais",
      "B) Não usar IA em nenhum país",
      "C) Criar sistemas totalmente independentes para cada país",
      "D) Adotar o framework mais restritivo como baseline global e aplicar customizações regionais"
    ],
    correct: 3,
    explanation: "Utilizar o padrão regulatório mais rigoroso como base reduz riscos de compliance e facilita a adaptação a requisitos regionais específicos."
  },
];


