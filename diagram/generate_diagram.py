"""
Diagrama de Arquitetura - CloudTrilhas (Terraform Serverless)
Gera um diagrama PNG com ícones oficiais dos serviços AWS.

Requisitos:
  pip install diagrams
  Graphviz instalado (https://graphviz.org/download/)

Atualizado para refletir a arquitetura atual:
  - Autenticação de alunos com Amazon Cognito
  - CloudTrail REMOVIDO (gerava custo alto de S3; monitoramento via CloudFront metrics)
  - CloudFront Function bloqueando bots no edge (contenção de custo)
  - Contador de visitantes, painel admin e sandbox client-side (Pyodide)
"""

from diagrams import Diagram, Cluster, Edge
from diagrams.aws.compute import Lambda
from diagrams.aws.network import CloudFront, Route53, APIGateway
from diagrams.aws.storage import S3
from diagrams.aws.database import Dynamodb
from diagrams.aws.integration import SQS, SNS, Eventbridge
from diagrams.aws.management import Cloudwatch
from diagrams.aws.security import ACM, IAMRole, Cognito
from diagrams.aws.general import Users, Client
from diagrams.aws.cost import Budgets

import os
os.environ["PATH"] += os.pathsep + r"C:\Program Files\Graphviz\bin"

graph_attr = {
    "fontsize": "28",
    "bgcolor": "white",
    "pad": "0.8",
    "nodesep": "0.8",
    "ranksep": "1.2",
}

with Diagram(
    "CloudTrilhas - Arquitetura Serverless AWS",
    filename="cloudtrilhas_architecture",
    show=False,
    direction="LR",
    graph_attr=graph_attr,
    outformat="png",
):

    users = Users("Usuários / Alunos")

    # --- DNS & CDN ---
    with Cluster("DNS & CDN"):
        route53 = Route53("Route53\ncloudtrilhas.com.br")
        acm = ACM("ACM\nCertificado TLS\n(us-east-1)")
        cloudfront = CloudFront("CloudFront\nOAC + Geo-Restriction\n+ Bot-block (edge)")

    # --- Static Site ---
    with Cluster("Hospedagem Estática"):
        s3_site = S3("S3 Bucket\nSite Estático\n(HTML/CSS/JS/PDFs)")
        sandbox = Client("Sandbox Python\n(Pyodide / WASM)\nclient-side")

    # --- Autenticação de Alunos ---
    with Cluster("Autenticação de Alunos"):
        cognito = Cognito("Amazon Cognito\nUser Pool\n(login por email)")

    # --- API & Backends ---
    with Cluster("APIs Serverless"):
        api_gw = APIGateway("API Gateway HTTP")
        register_lead = Lambda("Lambda\nRegister Lead")
        visitor_counter = Lambda("Lambda\nVisitor Counter")
        admin_auth = Lambda("Lambda\nAdmin Auth")
        analytics = Lambda("Lambda\nAnalytics")
        dynamodb = Dynamodb("DynamoDB\nLeads / Counter /\nAdmin (PAY_PER_REQUEST)")

    # --- Download Monitoring (sem CloudTrail) ---
    with Cluster("Métricas de Download"):
        eventbridge = Eventbridge("EventBridge\nPDF Download Rule")
        download_metrics_lambda = Lambda("Lambda\nDownload Metrics")

    # --- Event Processing ---
    with Cluster("Processamento de Eventos"):
        eventbridge_custom = Eventbridge("EventBridge\nCustom Events\n(app.serverless)")
        sqs_main = SQS("SQS\nMain Queue")
        sqs_dlq = SQS("SQS\nDLQ\n(maxReceive=3)")
        hello_lambda = Lambda("Lambda\nHello Lambda")

    # --- Notifications ---
    with Cluster("Notificações"):
        sns = SNS("SNS Topic\nAlertas & Eventos")

    # --- Observability ---
    with Cluster("Observabilidade"):
        cw_dashboard = Cloudwatch("CloudWatch\nDashboards\n(Downloads + Operacional)")
        cw_operational = Cloudwatch("CloudWatch\nAlarmes")

    # --- CI/CD & Cost (Shared Environment) ---
    with Cluster("Shared (Cross-Environment)"):
        github_oidc = IAMRole("GitHub Actions\nOIDC Role")
        budget = Budgets("AWS Budget\n$10/mês")

    # ===== FLUXO 1: Conteúdo Estático =====
    users >> Edge(label="HTTPS") >> route53
    route53 >> cloudfront
    acm >> Edge(style="dashed") >> cloudfront
    cloudfront >> Edge(label="OAC\n(private access)") >> s3_site
    s3_site >> Edge(style="dashed", label="serve") >> sandbox

    # ===== FLUXO 2: Autenticação de Alunos =====
    users >> Edge(label="login/cadastro", color="purple") >> cognito
    cognito >> Edge(label="token", style="dashed", color="purple") >> users

    # ===== FLUXO 3: APIs (Leads, Counter, Admin, Analytics) =====
    users >> Edge(label="HTTPS", color="darkgreen") >> api_gw
    api_gw >> register_lead
    api_gw >> visitor_counter
    api_gw >> admin_auth
    api_gw >> analytics
    register_lead >> Edge(label="PutItem") >> dynamodb
    visitor_counter >> Edge(label="Atomic++") >> dynamodb
    admin_auth >> dynamodb
    analytics >> dynamodb

    # ===== FLUXO 4: Métricas de Download (sem CloudTrail) =====
    cloudfront >> Edge(label="acesso a PDF", style="dashed") >> eventbridge
    eventbridge >> Edge(label="Invoke") >> download_metrics_lambda
    download_metrics_lambda >> Edge(label="PutMetricData") >> cw_dashboard

    # ===== FLUXO 5: Eventos Customizados =====
    eventbridge_custom >> Edge(label="SendMessage") >> sqs_main
    sqs_main >> Edge(label="Trigger") >> hello_lambda
    hello_lambda >> Edge(label="Publish") >> sns
    sqs_main >> Edge(label="Falha (3x)", style="dashed", color="red") >> sqs_dlq

    # ===== FLUXO 6: Observabilidade =====
    cw_operational >> Edge(color="orange", label="Alarmes") >> sns

    # ===== CI/CD (Shared) =====
    github_oidc >> Edge(style="dotted", label="Terraform\nApply/Plan") >> cloudfront

print("Diagrama gerado: cloudtrilhas_architecture.png")
