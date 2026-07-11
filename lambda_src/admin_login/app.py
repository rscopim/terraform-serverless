import base64
import hashlib
import json
import os
import secrets
from datetime import datetime, timedelta, timezone

import boto3

dynamodb = boto3.client("dynamodb")

USERS_TABLE = os.environ["USERS_TABLE"]
SESSIONS_TABLE = os.environ["SESSIONS_TABLE"]

SESSION_HOURS = 8
PASSWORD_ITERATIONS = 210_000

ALLOWED_ORIGINS = os.environ.get(
    "ALLOWED_ORIGINS",
    "https://www.cloudtrilhas.com.br,https://cloudtrilhas.com.br"
).split(",")


# ======================================================
# Resposta HTTP padronizada com CORS.
# ======================================================
def response(status_code, body, origin=None):
    allow_origin = origin if origin in ALLOWED_ORIGINS else ALLOWED_ORIGINS[0]

    return {
        "statusCode": status_code,
        "headers": {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": allow_origin,
            "Access-Control-Allow-Methods": "POST,OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type,Authorization",
            "Cache-Control": "no-store",
        },
        "body": json.dumps(body),
    }


def now_utc():
    return datetime.now(timezone.utc)


def now_iso():
    return now_utc().isoformat()


# ======================================================
# Converte o corpo JSON recebido pela API.
# ======================================================
def parse_body(event):
    try:
        body = event.get("body") or "{}"
        return json.loads(body)
    except json.JSONDecodeError:
        return None


# ======================================================
# Gera o hash PBKDF2 da senha.
# O salt e o número de iterações ficam salvos no usuário.
# ======================================================
def hash_password(password, salt, iterations):
    password_hash = hashlib.pbkdf2_hmac(
        "sha256",
        password.encode("utf-8"),
        salt.encode("utf-8"),
        iterations,
    )

    return base64.b64encode(password_hash).decode("utf-8")


def verify_password(password, salt, stored_hash, iterations):
    calculated_hash = hash_password(password, salt, iterations)

    return secrets.compare_digest(
        calculated_hash,
        stored_hash,
    )


def get_user(username):
    result = dynamodb.get_item(
        TableName=USERS_TABLE,
        Key={
            "username": {
                "S": username
            }
        },
        ConsistentRead=True,
    )

    return result.get("Item")


# ======================================================
# O token original é entregue ao navegador.
# No DynamoDB é salvo somente o hash SHA-256.
# ======================================================
def create_session_token():
    return secrets.token_urlsafe(48)


def hash_session_token(token):
    return hashlib.sha256(
        token.encode("utf-8")
    ).hexdigest()


def get_source_ip(event):
    return (
        event.get("requestContext", {})
        .get("http", {})
        .get("sourceIp", "")
    )


def save_session(username, token, expires_at, source_ip):
    token_hash = hash_session_token(token)

    dynamodb.put_item(
        TableName=SESSIONS_TABLE,
        Item={
            "token_hash": {
                "S": token_hash
            },
            "username": {
                "S": username
            },
            "created_at": {
                "S": now_iso()
            },
            "expires_at": {
                "N": str(int(expires_at.timestamp()))
            },
            "source_ip": {
                "S": source_ip
            },
        },
    )


def update_last_login(username, source_ip):
    dynamodb.update_item(
        TableName=USERS_TABLE,
        Key={
            "username": {
                "S": username
            }
        },
        UpdateExpression="""
            SET last_login = :last_login,
                last_login_ip = :last_login_ip
        """,
        ExpressionAttributeValues={
            ":last_login": {
                "S": now_iso()
            },
            ":last_login_ip": {
                "S": source_ip
            },
        },
    )


# ======================================================
# Autenticação do usuário administrativo.
# ======================================================
def login(event, origin):
    body = parse_body(event)

    if body is None:
        return response(
            400,
            {"message": "invalid JSON body"},
            origin,
        )

    username = body.get("username", "").strip().lower()
    password = body.get("password", "")

    if not username or not password:
        return response(
            400,
            {"message": "username and password are required"},
            origin,
        )

    user = get_user(username)

    # A mesma mensagem é retornada para usuário inexistente
    # ou senha incorreta, evitando enumeração de usuários.
    if not user:
        return response(
            401,
            {"message": "invalid credentials"},
            origin,
        )

    status = user.get("status", {}).get("S", "DISABLED")

    if status != "ACTIVE":
        return response(
            403,
            {"message": "user inactive"},
            origin,
        )

    salt = user.get("password_salt", {}).get("S", "")
    stored_hash = user.get("password_hash", {}).get("S", "")
    iterations = int(
        user.get(
            "password_iterations",
            {"N": str(PASSWORD_ITERATIONS)}
        )["N"]
    )

    if not salt or not stored_hash:
        return response(
            401,
            {"message": "invalid credentials"},
            origin,
        )

    if not verify_password(
        password,
        salt,
        stored_hash,
        iterations,
    ):
        return response(
            401,
            {"message": "invalid credentials"},
            origin,
        )

    token = create_session_token()
    expires_at = now_utc() + timedelta(hours=SESSION_HOURS)
    source_ip = get_source_ip(event)

    save_session(
        username,
        token,
        expires_at,
        source_ip,
    )

    update_last_login(
        username,
        source_ip,
    )

    return response(
        200,
        {
            "message": "login successful",
            "token": token,
            "expires_at": expires_at.isoformat(),
            "user": {
                "username": username,
                "name": user.get("name", {}).get("S", ""),
                "email": user.get("email", {}).get("S", ""),
                "role": user.get("role", {}).get("S", "ADMIN"),
            },
        },
        origin,
    )


def lambda_handler(event, context):
    method = (
        event.get("requestContext", {})
        .get("http", {})
        .get("method", "")
    )

    headers = event.get("headers") or {}
    origin = headers.get("origin") or headers.get("Origin") or ""

    if method == "OPTIONS":
        return response(
            200,
            {"message": "ok"},
            origin,
        )

    if origin and origin not in ALLOWED_ORIGINS:
        return response(
            403,
            {"message": "origin not allowed"},
            origin,
        )

    if method != "POST":
        return response(
            405,
            {"message": "method not allowed"},
            origin,
        )

    return login(event, origin)