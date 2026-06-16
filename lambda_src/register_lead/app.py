import json
import os
import uuid
from datetime import datetime, timezone

import boto3

dynamodb = boto3.resource("dynamodb")
table = dynamodb.Table(os.environ["LEADS_TABLE_NAME"])
sns = boto3.client("sns")
cloudwatch = boto3.client("cloudwatch")

PDF_BASE_URL = os.environ["PDF_BASE_URL"]
SNS_TOPIC_ARN = os.environ.get("SNS_TOPIC_ARN", "")


def response(status_code, body):
    return {
        "statusCode": status_code,
        "headers": {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type",
        },
        "body": json.dumps(body),
    }


def notify_download(name, email, material):
    """Envia notificação SNS e registra métrica CloudWatch para downloads."""
    try:
        if SNS_TOPIC_ARN:
            sns.publish(
                TopicArn=SNS_TOPIC_ARN,
                Subject=f"CloudTrilhas - Download: {material}",
                Message=f"Novo download realizado:\n\nNome: {name}\nEmail: {email}\nMaterial: {material}\nData: {datetime.now(timezone.utc).isoformat()}",
            )
    except Exception as e:
        print(f"Erro SNS: {e}")

    try:
        cloudwatch.put_metric_data(
            Namespace="CloudTrilhas",
            MetricData=[
                {
                    "MetricName": "PDFDownloads",
                    "Dimensions": [{"Name": "Material", "Value": material}],
                    "Value": 1,
                    "Unit": "Count",
                }
            ],
        )
    except Exception as e:
        print(f"Erro CloudWatch metric: {e}")


def notify_simulado(record_type, page, name, email, score, total):
    """Registra métrica CloudWatch para acessos e resultados de simulados."""
    try:
        metric_name = "SimuladoAccess" if record_type == "simulado-access" else "SimuladoResult"
        cloudwatch.put_metric_data(
            Namespace="CloudTrilhas",
            MetricData=[
                {
                    "MetricName": metric_name,
                    "Dimensions": [{"Name": "Page", "Value": page}],
                    "Value": 1,
                    "Unit": "Count",
                }
            ],
        )
    except Exception as e:
        print(f"Erro CloudWatch metric simulado: {e}")


def lambda_handler(event, context):
    print("Evento recebido:", event)

    if event.get("requestContext", {}).get("http", {}).get("method") == "OPTIONS":
        return response(200, {"message": "CORS OK"})

    try:
        body = json.loads(event.get("body") or "{}")

        name = body.get("name", "").strip()
        email = body.get("email", "").strip().lower()
        consent = body.get("consent", False)
        material = body.get("material", "")
        record_type = body.get("type", "lead")

        # ===== TRACKING DE SIMULADOS (sem validação de email) =====
        if record_type in ("simulado-access", "simulado-result"):
            lead_id = str(uuid.uuid4())
            created_at = datetime.now(timezone.utc).isoformat()
            page = body.get("page", material)
            score = body.get("score", 0)
            total = body.get("total", 0)

            item = {
                "lead_id": lead_id,
                "type": record_type,
                "page": page,
                "created_at": created_at,
                "source": "simulado",
            }

            # Adiciona nome/email se fornecidos
            if name and name != "anonymous":
                item["name"] = name
            if email and "@" in email:
                item["email"] = email
            if record_type == "simulado-result":
                item["score"] = score
                item["total"] = total
                item["percent"] = round((score / total) * 100) if total > 0 else 0

            table.put_item(Item=item)
            notify_simulado(record_type, page, name, email, score, total)

            return response(200, {"message": "Registro salvo."})

        # ===== REGISTRO DE LEAD (download de PDF) =====
        if not name or not email:
            return response(400, {"message": "Nome e e-mail são obrigatórios."})

        if "@" not in email:
            return response(400, {"message": "E-mail inválido."})

        if not consent:
            return response(
                400,
                {"message": "É necessário aceitar o uso dos dados para baixar o material."},
            )

        lead_id = str(uuid.uuid4())
        created_at = datetime.now(timezone.utc).isoformat()

        table.put_item(
            Item={
                "lead_id": lead_id,
                "type": "lead",
                "name": name,
                "email": email,
                "material": material,
                "created_at": created_at,
                "source": "portal-estudos",
                "lgpd_consent": consent,
            }
        )

        # Notifica download via SNS + CloudWatch metric
        notify_download(name, email, material)

        # Build download URL based on requested material
        download_url = f"{PDF_BASE_URL}/{material}"

        return response(
            200, {"message": "Cadastro realizado com sucesso.", "download_url": download_url}
        )

    except Exception as error:
        print("Erro:", str(error))
        return response(500, {"message": "Erro interno ao registrar usuário."})
