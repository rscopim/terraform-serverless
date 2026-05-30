# Diagrama de Arquitetura - CloudTrilhas

## Diagrama com Ícones AWS (PNG)

O arquivo `cloudtrilhas_architecture.png` contém o diagrama completo com ícones oficiais dos serviços AWS.

Para regenerar:
```bash
pip install diagrams
# Instalar Graphviz: https://graphviz.org/download/
python generate_diagram.py
```

## Visão Geral da Arquitetura (Mermaid)

```mermaid
flowchart LR
    subgraph Users["👤 Usuários"]
        user[Usuário]
    end

    subgraph DNS["🌐 DNS & CDN"]
        R53[Route53<br/>cloudtrilhas.com.br]
        ACM[ACM<br/>Certificado TLS]
        CF[CloudFront<br/>OAC + Geo-Restriction]
    end

    subgraph Static["📦 Hospedagem Estática"]
        S3[S3 Bucket<br/>Site Estático<br/>HTML/CSS/JS/PDFs]
    end

    subgraph LeadCapture["📝 Captura de Leads"]
        APIGW[API Gateway<br/>HTTP API<br/>POST /leads]
        RegLead[Lambda<br/>Register Lead]
        DDB[DynamoDB<br/>Leads Table]
    end

    subgraph Downloads["📊 Monitoramento Downloads"]
        CT[CloudTrail<br/>S3 GetObject]
        EB[EventBridge<br/>PDF Download Rule]
        DMLambda[Lambda<br/>Download Metrics]
    end

    subgraph Events["⚡ Processamento de Eventos"]
        EBCustom[EventBridge<br/>Custom Events]
        SQS[SQS<br/>Main Queue]
        DLQ[SQS DLQ]
        HelloLambda[Lambda<br/>Hello Lambda]
    end

    subgraph Notifications["🔔 Notificações"]
        SNS[SNS Topic]
    end

    subgraph Observability["📈 Observabilidade"]
        CWDash[CloudWatch<br/>Dashboard]
        CWAlarms[CloudWatch<br/>Alarmes]
    end

    subgraph CICD["🚀 CI/CD & Custos"]
        GH[GitHub Actions<br/>OIDC]
        Budget[AWS Budget<br/>$10/mês]
    end

    %% Fluxo 1: Conteúdo Estático
    user -->|HTTPS| R53
    R53 --> CF
    ACM -.-> CF
    CF -->|OAC| S3

    %% Fluxo 2: Captura de Leads
    user -->|POST /leads| APIGW
    APIGW --> RegLead
    RegLead --> DDB

    %% Fluxo 3: Monitoramento Downloads
    S3 -.->|GetObject| CT
    CT --> EB
    EB --> SNS
    EB --> DMLambda
    DMLambda -->|Custom Metrics| CWDash

    %% Fluxo 4: Eventos Customizados
    EBCustom --> SQS
    SQS --> HelloLambda
    HelloLambda --> SNS
    SQS -.->|3 retries| DLQ

    %% Fluxo 5: Observabilidade
    CWAlarms -->|Alertas| SNS

    %% CI/CD
    GH -.->|Terraform Apply| S3
```

## Serviços AWS Utilizados (17 módulos)

| Serviço | Função |
|---------|--------|
| **Route53** | DNS para cloudtrilhas.com.br |
| **ACM** | Certificado TLS (us-east-1) |
| **CloudFront** | CDN com OAC e geo-restrição (América do Sul + Portugal) |
| **S3** | Hospedagem do site estático (HTML, CSS, JS, PDFs) |
| **API Gateway** | HTTP API v2 - endpoint POST /leads |
| **Lambda (Register Lead)** | Captura leads e grava no DynamoDB |
| **Lambda (Download Metrics)** | Processa eventos de download e publica métricas |
| **Lambda (Hello Lambda)** | Consome mensagens SQS e publica no SNS |
| **DynamoDB** | Tabela de leads (PAY_PER_REQUEST) |
| **SQS** | Fila principal + DLQ (3 retries) |
| **SNS** | Tópico de notificações e alertas |
| **EventBridge** | Roteamento de eventos (downloads + custom) |
| **CloudTrail** | Rastreamento de GetObject no S3 |
| **CloudWatch** | Dashboard operacional + 8 alarmes |
| **AWS Budgets** | Controle de custos ($10/mês) |
| **IAM (OIDC)** | Autenticação GitHub Actions |

## Fluxos Principais

1. **Conteúdo Estático**: Usuário → Route53 → CloudFront (TLS + Geo) → S3
2. **Captura de Leads**: Usuário → API Gateway → Lambda → DynamoDB
3. **Monitoramento Downloads**: S3 → CloudTrail → EventBridge → Lambda/SNS → CloudWatch
4. **Eventos Customizados**: EventBridge → SQS → Lambda → SNS (com DLQ)
5. **Observabilidade**: CloudWatch Alarms → SNS (notificações)
6. **CI/CD**: GitHub Actions → OIDC → Terraform Apply
