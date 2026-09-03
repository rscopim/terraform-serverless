"""
CloudTrilhas — Cognito Post Confirmation Trigger

Executado automaticamente pelo Cognito quando um aluno CONFIRMA o cadastro
(ou tem a conta confirmada). Grava os dados do novo usuário na tabela de leads
(Terraform-Serverless-prod-leads), mantendo o registro de captação — agora
alimentado pelo cadastro no Cognito, não mais por formulários no site.

Também publica notificação por SNS e registra métrica no CloudWatch (opcional),
seguindo o padrão do register_lead.
"""
import os
import uuid
from datetime import datetime, timezone

import boto3

dynamodb = boto3.resource("dynamodb")
table = dynamodb.Table(os.environ["LEADS_TABLE_NAME"])
sns = boto3.client("sns")
cloudwatch = boto3.client("cloudwatch")

SNS_TOPIC_ARN = os.environ.get("SNS_TOPIC_ARN", "")


def lambda_handler(event, context):
    # O Cognito envia os atributos do usuário confirmado
    attrs = (event.get("request", {}) or {}).get("userAttributes", {}) or {}
    email = (attrs.get("email") or event.get("userName") or "").strip().lower()
    name = (attrs.get("name") or "").strip()
    trigger = event.get("triggerSource", "")

    # Só grava no fluxo de confirmação de cadastro (evita duplicar em outros triggers)
    if trigger not in ("PostConfirmation_ConfirmSignUp", "PostConfirmation_ConfirmForgotPassword"):
        return event

    # Em recuperação de senha não é um cadastro novo — não registra lead
    if trigger == "PostConfirmation_ConfirmForgotPassword":
        return event

    if not email:
        return event

    lead_id = str(uuid.uuid4())
    created_at = datetime.now(timezone.utc).isoformat()

    try:
        table.put_item(
            Item={
                "lead_id": lead_id,
                "type": "cadastro",
                "name": name or email.split("@")[0],
                "email": email,
                "source": "cognito",
                "created_at": created_at,
                "lgpd_consent": True,
            }
        )
    except Exception as e:
        # Nunca falhar o fluxo de cadastro por causa do registro de lead
        print(f"Erro ao gravar lead do cadastro Cognito: {e}")

    # Notificação SNS (opcional)
    try:
        if SNS_TOPIC_ARN:
            sns.publish(
                TopicArn=SNS_TOPIC_ARN,
                Subject="CloudTrilhas - Novo cadastro (Cognito)",
                Message=(
                    f"Novo aluno cadastrado:\n\n"
                    f"Nome: {name}\nEmail: {email}\nData: {created_at}"
                ),
            )
    except Exception as e:
        print(f"Erro SNS cadastro: {e}")

    # Métrica CloudWatch (opcional)
    try:
        cloudwatch.put_metric_data(
            Namespace="CloudTrilhas",
            MetricData=[
                {
                    "MetricName": "NovoCadastro",
                    "Dimensions": [{"Name": "Source", "Value": "cognito"}],
                    "Value": 1,
                    "Unit": "Count",
                }
            ],
        )
    except Exception as e:
        print(f"Erro CloudWatch metric cadastro: {e}")

    # IMPORTANTE: sempre retornar o event para o Cognito concluir o fluxo
    return event
