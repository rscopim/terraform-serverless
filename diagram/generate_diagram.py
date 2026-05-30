"""
Diagrama de Arquitetura - CloudTrilhas (Terraform Serverless)
Gera um diagrama PNG com ícones oficiais dos serviços AWS.

Requisitos:
  pip install diagrams
  Graphviz instalado (https://graphviz.org/download/)
"""

from diagrams import Diagram, Cluster, Edge
from diagrams.aws.compute import Lambda
from diagrams.aws.network import CloudFront, Route53, APIGateway
from diagrams.aws.storage import S3
from diagrams.aws.database import Dynamodb
from diagrams.aws.integration import SQS, SNS, Eventbridge
from diagrams.aws.management import Cloudwatch, Cloudtrail
from diagrams.aws.security import ACM, IAMRole
from diagrams.aws.general import Users
from diagrams.aws.devtools import Codebuild
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

    users = Users("Usuários")

    # --- DNS & CDN ---
    with Cluster("DNS & CDN"):
        route53 = Route53("Route53\ncloudtrilhas.com.br")
        acm = ACM("ACM\nCertificado TLS\n(us-east-1)")
        cloudfront = CloudFront("CloudFront\nOAC + Geo-Restriction\n(LATAM + PT)")

    # --- Static Site ---
    with Cluster("Hospedagem Estática"):
        s3_site = S3("S3 Bucket\nSite Estático\n(HTML/CSS/JS/PDFs)")

    # --- API & Lead Capture ---
    with Cluster("Captura de Leads"):
        api_gw = APIGateway("API Gateway HTTP\nPOST /leads")
        register_lead = Lambda("Lambda\nRegister Lead")
        dynamodb = Dynamodb("DynamoDB\nLeads Table\n(PAY_PER_REQUEST)")

    # --- Download Monitoring ---
    with Cluster("Monitoramento de Downloads"):
        cloudtrail = Cloudtrail("CloudTrail\nS3 GetObject\n(materiais/)")
        s3_trail_logs = S3("S3 Bucket\nCloudTrail Logs")
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
        cw_dashboard_downloads = Cloudwatch("CloudWatch\nDashboard Downloads\n(Custom Metrics)")
        cw_operational = Cloudwatch("CloudWatch\nDashboard Operacional\n+ 8 Alarmes")

    # --- CI/CD & Cost (Shared Environment) ---
    with Cluster("Shared (Cross-Environment)"):
        github_oidc = IAMRole("GitHub Actions\nOIDC Role")
        budget = Budgets("AWS Budget\n$10/mês")

    # ===== FLUXO 1: Conteúdo Estático =====
    users >> Edge(label="HTTPS") >> route53
    route53 >> cloudfront
    acm >> Edge(style="dashed") >> cloudfront
    cloudfront >> Edge(label="OAC\n(private access)") >> s3_site

    # ===== FLUXO 2: Captura de Leads =====
    users >> Edge(label="POST /leads", color="darkgreen") >> api_gw
    api_gw >> register_lead
    register_lead >> Edge(label="PutItem") >> dynamodb
    register_lead >> Edge(label="Retorna PDF URL", style="dashed", color="darkgreen") >> users

    # ===== FLUXO 3: Monitoramento de Downloads =====
    s3_site >> Edge(label="GetObject event", style="dashed") >> cloudtrail
    cloudtrail >> Edge(label="Logs") >> s3_trail_logs
    cloudtrail >> eventbridge
    eventbridge >> Edge(label="Notificação") >> sns
    eventbridge >> Edge(label="Invoke") >> download_metrics_lambda
    download_metrics_lambda >> Edge(label="PutMetricData") >> cw_dashboard_downloads

    # ===== FLUXO 4: Eventos Customizados =====
    eventbridge_custom >> Edge(label="SendMessage") >> sqs_main
    sqs_main >> Edge(label="Trigger") >> hello_lambda
    hello_lambda >> Edge(label="Publish") >> sns
    sqs_main >> Edge(label="Falha (3x)", style="dashed", color="red") >> sqs_dlq

    # ===== FLUXO 5: Observabilidade =====
    cw_operational >> Edge(color="orange", label="Alarmes") >> sns

    # ===== CI/CD (Shared) =====
    github_oidc >> Edge(style="dotted", label="Terraform\nApply/Plan") >> cloudfront

print("✅ Diagrama gerado: cloudtrilhas_architecture.png")
