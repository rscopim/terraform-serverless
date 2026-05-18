import json
import os
import uuid
from datetime import datetime, timezone

import boto3

dynamodb = boto3.resource("dynamodb")
table = dynamodb.Table(os.environ["LEADS_TABLE_NAME"])

PDF_URL = os.environ["PDF_URL"]

def response(status_code, body):
    return {
        "statusCode": status_code,
        "headers": {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type"
        },
        "body": json.dumps(body)
    }

def lambda_handler(event, context):
    print("Evento recebido:", event)

    if event.get("requestContext", {}).get("http", {}).get("method") == "OPTIONS":
        return response(200, {"message": "CORS OK"})

    try:
        body = json.loads(event.get("body") or "{}")

        name = body.get("name", "").strip()
        email = body.get("email", "").strip().lower()
        consent = body.get("consent", False)
        material = body.get("material", "orientacoes-gerais-aws-caf.pdf")

        if not name or not email:
            return response(400, {"message": "Nome e e-mail são obrigatórios."})

        if "@" not in email:
            return response(400, {"message": "E-mail inválido."})

        if not consent:
            return response(400, {"message": "É necessário aceitar o uso dos dados para baixar o material."})

        lead_id = str(uuid.uuid4())
        created_at = datetime.now(timezone.utc).isoformat()

        table.put_item(
            Item={
                "lead_id": lead_id,
                "name": name,
                "email": email,
                "material": material,
                "created_at": created_at,
                "source": "portal-estudos",
                "lgpd_consent": consent
            }
        )

        return response(200, {
            "message": "Cadastro realizado com sucesso.",
            "download_url": PDF_URL
        })

    except Exception as error:
        print("Erro:", str(error))
        return response(500, {"message": "Erro interno ao registrar usuário."})