"""
CloudTrilhas — Student Progress API

Guarda e recupera o progresso do aluno (trilhas/módulos concluídos) e o
histórico de resultados de simulados. A identidade do aluno é obtida de forma
segura validando o Access Token do Cognito via GetUser — sem bibliotecas
externas de JWT.

Rotas:
  GET  /progress           → retorna o progresso do aluno autenticado
  POST /progress           → mescla/atualiza progresso (módulos concluídos)
  POST /progress/quiz      → registra um resultado de simulado (histórico)
  OPTIONS /progress*       → CORS preflight

Autenticação: header Authorization: Bearer <accessToken do Cognito>
"""
import json
import os
import time
import uuid
import boto3
from botocore.exceptions import ClientError

dynamodb = boto3.client("dynamodb")
cognito = boto3.client("cognito-idp")

TABLE_NAME = os.environ["TABLE_NAME"]
# Tabela de leads (opcional): quando definida, a "origem" respondida pelo aluno
# tambem e gravada como lead com o campo institution, alimentando o analytics.
LEADS_TABLE_NAME = os.environ.get("LEADS_TABLE_NAME", "")
ALLOWED_ORIGINS = os.environ.get(
    "ALLOWED_ORIGINS",
    "https://www.cloudtrilhas.com.br,https://cloudtrilhas.com.br",
).split(",")


def response(status_code, body, origin=None):
    allow_origin = origin if origin in ALLOWED_ORIGINS else ALLOWED_ORIGINS[0]
    return {
        "statusCode": status_code,
        "headers": {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": allow_origin,
            "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
            "Access-Control-Allow-Headers": "authorization,content-type",
        },
        "body": json.dumps(body),
    }


def get_authenticated_email(headers):
    """Valida o access token do Cognito e retorna o e-mail do aluno.

    Usa GetUser: se o token for inválido/expirado, o Cognito rejeita —
    portanto isso serve simultaneamente como validação e identificação.
    """
    auth = headers.get("authorization") or headers.get("Authorization") or ""
    if not auth.lower().startswith("bearer "):
        return None
    access_token = auth.split(" ", 1)[1].strip()
    if not access_token:
        return None
    try:
        user = cognito.get_user(AccessToken=access_token)
    except ClientError:
        return None

    email = None
    for attr in user.get("UserAttributes", []):
        if attr["Name"] == "email":
            email = attr["Value"]
            break
    # Fallback para o Username (que é o e-mail, já que login é por email)
    return email or user.get("Username")


def get_progress(student_id):
    result = dynamodb.get_item(
        TableName=TABLE_NAME,
        Key={"student_id": {"S": student_id}},
        ConsistentRead=True,
    )
    item = result.get("Item")
    if not item:
        return {"trails": {}, "quizzes": [], "origin": ""}
    return {
        "trails": json.loads(item.get("trails", {}).get("S", "{}")),
        "quizzes": json.loads(item.get("quizzes", {}).get("S", "[]")),
        # "origin" = resposta do aluno: "De onde voce esta vindo?"
        "origin": item.get("origin", {}).get("S", ""),
    }


def save_progress(student_id, data):
    item = {
        "student_id": {"S": student_id},
        "trails": {"S": json.dumps(data.get("trails", {}))},
        "quizzes": {"S": json.dumps(data.get("quizzes", []))},
        "updated_at": {"N": str(int(time.time()))},
    }
    origin_val = (data.get("origin") or "").strip()
    if origin_val:
        item["origin"] = {"S": origin_val}
    dynamodb.put_item(TableName=TABLE_NAME, Item=item)


def registrar_lead_origem(email, name, origin_text):
    """Grava a origem informada como lead (campo institution) para o analytics.

    Nunca lanca excecao para o chamador — falha aqui nao deve impedir o aluno
    de acessar o conteudo.
    """
    if not LEADS_TABLE_NAME:
        return
    try:
        dynamodb.put_item(
            TableName=LEADS_TABLE_NAME,
            Item={
                "lead_id": {"S": str(uuid.uuid4())},
                "type": {"S": "origem"},
                "name": {"S": name or (email.split("@")[0] if email else "")},
                "email": {"S": email or ""},
                "institution": {"S": origin_text},
                "source": {"S": "trail-gate"},
                "created_at": {"S": _now_iso()},
                "lgpd_consent": {"BOOL": True},
            },
        )
    except Exception as e:  # noqa: BLE001
        print(f"Erro ao gravar lead de origem: {e}")


def _now_iso():
    from datetime import datetime, timezone
    return datetime.now(timezone.utc).isoformat()


def lambda_handler(event, context):
    ctx = event.get("requestContext", {}).get("http", {})
    method = ctx.get("method", "")
    path = ctx.get("path", "")
    headers = event.get("headers") or {}
    origin = headers.get("origin") or headers.get("Origin") or ""

    if method == "OPTIONS":
        return response(200, {"message": "ok"}, origin)

    email = get_authenticated_email(headers)
    if not email:
        return response(401, {"message": "não autenticado"}, origin)

    # GET /progress → retorna progresso
    if method == "GET":
        return response(200, get_progress(email), origin)

    # POST /progress/origin → registra a "origem" do aluno (obrigatória no 1º acesso)
    if method == "POST" and path.endswith("/origin"):
        try:
            body = json.loads(event.get("body") or "{}")
        except json.JSONDecodeError:
            return response(400, {"message": "body inválido"}, origin)

        origem = (body.get("origin") or "").strip()
        # Validação: obrigatório e com o mínimo de 2 caracteres
        if len(origem) < 2:
            return response(422, {"message": "origem obrigatória (mínimo 2 caracteres)"}, origin)
        # Limita o tamanho para evitar abuso
        origem = origem[:120]

        data = get_progress(email)
        ja_tinha = bool((data.get("origin") or "").strip())
        data["origin"] = origem
        save_progress(email, data)

        # Grava o lead de origem apenas na primeira vez que o aluno responde
        if not ja_tinha:
            registrar_lead_origem(email, body.get("name", ""), origem)

        return response(200, {"message": "origem registrada", "origin": origem}, origin)

    # POST /progress/quiz → adiciona resultado de simulado ao histórico
    if method == "POST" and path.endswith("/quiz"):
        try:
            body = json.loads(event.get("body") or "{}")
        except json.JSONDecodeError:
            return response(400, {"message": "body inválido"}, origin)

        data = get_progress(email)
        quizzes = data.get("quizzes", [])
        quizzes.append({
            "trail": body.get("trail", "desconhecida"),
            "quiz": body.get("quiz", ""),
            "score": int(body.get("score", 0)),
            "total": int(body.get("total", 0)),
            "percent": int(body.get("percent", 0)),
            "ts": int(time.time()),
        })
        # Mantém no máximo os últimos 200 resultados
        data["quizzes"] = quizzes[-200:]
        save_progress(email, data)
        return response(200, {"message": "resultado registrado", "quizzes": data["quizzes"]}, origin)

    # POST /progress → mescla módulos concluídos
    if method == "POST":
        try:
            body = json.loads(event.get("body") or "{}")
        except json.JSONDecodeError:
            return response(400, {"message": "body inválido"}, origin)

        data = get_progress(email)
        trails = data.get("trails", {})

        # body esperado: { "trail": "python", "module": "modulo-03", "done": true }
        trail = body.get("trail")
        module = body.get("module")
        if trail and module:
            trail_data = trails.get(trail, {})
            if body.get("done", True):
                trail_data[module] = {"done": True, "ts": int(time.time())}
            else:
                trail_data.pop(module, None)
            trails[trail] = trail_data

        # Também aceita substituição completa (sincronização a partir do localStorage)
        if isinstance(body.get("trails"), dict):
            for t, mods in body["trails"].items():
                merged = trails.get(t, {})
                merged.update(mods)
                trails[t] = merged

        data["trails"] = trails
        save_progress(email, data)
        return response(200, {"message": "progresso salvo", "trails": trails}, origin)

    return response(405, {"message": "método não permitido"}, origin)
