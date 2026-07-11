import base64
import hashlib
import json
import os
import secrets
import uuid
from datetime import datetime, timedelta, timezone

import boto3

dynamodb = boto3.client("dynamodb")

USERS_TABLE = os.environ["USERS_TABLE"]
SESSIONS_TABLE = os.environ["SESSIONS_TABLE"]

SESSION_IDLE_MINUTES = int(os.environ.get("SESSION_IDLE_MINUTES", "30"))
SESSION_MAX_HOURS = int(os.environ.get("SESSION_MAX_HOURS", "8"))
PASSWORD_ITERATIONS = 210_000

ALLOWED_ORIGINS = [
    origin.strip()
    for origin in os.environ.get(
        "ALLOWED_ORIGINS",
        "https://www.cloudtrilhas.com.br,https://cloudtrilhas.com.br",
    ).split(",")
    if origin.strip()
]


# ======================================================
# Retorna uma resposta HTTP padronizada.
# Cache-Control impede o armazenamento de dados sensíveis.
# ======================================================
def response(status_code, body, origin=None):
    allow_origin = (
        origin
        if origin in ALLOWED_ORIGINS
        else ALLOWED_ORIGINS[0]
    )

    return {
        "statusCode": status_code,
        "headers": {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": allow_origin,
            "Access-Control-Allow-Methods": "POST,OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type,Authorization",
            "Cache-Control": "no-store",
            "Pragma": "no-cache",
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
        parsed = json.loads(body)

        if not isinstance(parsed, dict):
            return None

        return parsed
    except (json.JSONDecodeError, TypeError):
        return None


# ======================================================
# Gera o hash PBKDF2 da senha.
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
    calculated_hash = hash_password(
        password,
        salt,
        iterations,
    )

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
# Gera um token seguro.
# Somente o hash SHA-256 do token será salvo no DynamoDB.
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


def get_user_agent(event):
    headers = event.get("headers") or {}

    return (
        headers.get("user-agent")
        or headers.get("User-Agent")
        or ""
    )[:500]


def get_bearer_token(event):
    headers = event.get("headers") or {}

    authorization = (
        headers.get("authorization")
        or headers.get("Authorization")
        or ""
    )

    if not authorization.startswith("Bearer "):
        return None

    token = authorization.removeprefix("Bearer ").strip()

    return token or None


# ======================================================
# Cria a sessão administrativa.
#
# expires_at:
#   expiração por inatividade e atributo TTL.
#
# absolute_expires_at:
#   limite máximo da sessão, mesmo com atividade contínua.
# ======================================================
def save_session(
    username,
    token,
    session_id,
    idle_expires_at,
    absolute_expires_at,
    source_ip,
    user_agent,
):
    token_hash = hash_session_token(token)
    timestamp = now_iso()

    dynamodb.put_item(
        TableName=SESSIONS_TABLE,
        Item={
            "token_hash": {
                "S": token_hash
            },
            "session_id": {
                "S": session_id
            },
            "username": {
                "S": username
            },
            "created_at": {
                "S": timestamp
            },
            "last_activity": {
                "S": timestamp
            },
            "expires_at": {
                "N": str(int(idle_expires_at.timestamp()))
            },
            "absolute_expires_at": {
                "N": str(int(absolute_expires_at.timestamp()))
            },
            "source_ip": {
                "S": source_ip
            },
            "user_agent": {
                "S": user_agent
            },
        },
        ConditionExpression="attribute_not_exists(token_hash)",
    )


def update_last_login(username, source_ip):
    dynamodb.update_item(
        TableName=USERS_TABLE,
        Key={
            "username": {
                "S": username
            }
        },
        UpdateExpression=(
            "SET last_login = :last_login, "
            "last_login_ip = :last_login_ip"
        ),
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
# Autentica o usuário e cria uma nova sessão.
# ======================================================
def login(event, origin):
    body = parse_body(event)

    if body is None:
        return response(
            400,
            {"message": "invalid JSON body"},
            origin,
        )

    username = str(
        body.get("username", "")
    ).strip().lower()

    password = str(
        body.get("password", "")
    )

    if not username or not password:
        return response(
            400,
            {
                "message": (
                    "username and password are required"
                )
            },
            origin,
        )

    user = get_user(username)

    # Mesma resposta para usuário inexistente ou senha inválida.
    if not user:
        return response(
            401,
            {"message": "invalid credentials"},
            origin,
        )

    status = user.get(
        "status",
        {},
    ).get("S", "DISABLED")

    if status != "ACTIVE":
        return response(
            403,
            {"message": "user inactive"},
            origin,
        )

    salt = user.get(
        "password_salt",
        {},
    ).get("S", "")

    stored_hash = user.get(
        "password_hash",
        {},
    ).get("S", "")

    iterations = int(
        user.get(
            "password_iterations",
            {"N": str(PASSWORD_ITERATIONS)},
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

    current_time = now_utc()

    idle_expires_at = current_time + timedelta(
        minutes=SESSION_IDLE_MINUTES
    )

    absolute_expires_at = current_time + timedelta(
        hours=SESSION_MAX_HOURS
    )

    token = create_session_token()
    session_id = str(uuid.uuid4())
    source_ip = get_source_ip(event)
    user_agent = get_user_agent(event)

    save_session(
        username=username,
        token=token,
        session_id=session_id,
        idle_expires_at=idle_expires_at,
        absolute_expires_at=absolute_expires_at,
        source_ip=source_ip,
        user_agent=user_agent,
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
            "session_id": session_id,
            "expires_at": idle_expires_at.isoformat(),
            "absolute_expires_at": (
                absolute_expires_at.isoformat()
            ),
            "user": {
                "username": username,
                "name": user.get(
                    "name",
                    {},
                ).get("S", ""),
                "email": user.get(
                    "email",
                    {},
                ).get("S", ""),
                "role": user.get(
                    "role",
                    {},
                ).get("S", "VIEWER"),
            },
        },
        origin,
    )


# ======================================================
# Exclui a sessão associada ao Bearer Token.
# ======================================================
def logout(event, origin):
    token = get_bearer_token(event)

    if not token:
        return response(
            401,
            {"message": "unauthorized"},
            origin,
        )

    token_hash = hash_session_token(token)

    result = dynamodb.get_item(
        TableName=SESSIONS_TABLE,
        Key={
            "token_hash": {
                "S": token_hash
            }
        },
        ConsistentRead=True,
    )

    if not result.get("Item"):
        return response(
            401,
            {"message": "invalid or expired session"},
            origin,
        )

    dynamodb.delete_item(
        TableName=SESSIONS_TABLE,
        Key={
            "token_hash": {
                "S": token_hash
            }
        },
    )

    return response(
        200,
        {"message": "logout successful"},
        origin,
    )


def lambda_handler(event, context):
    method = (
        event.get("requestContext", {})
        .get("http", {})
        .get("method", "")
    )

    raw_path = event.get("rawPath", "")

    headers = event.get("headers") or {}

    origin = (
        headers.get("origin")
        or headers.get("Origin")
        or ""
    )

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

    if method == "POST" and raw_path == "/auth/login":
        return login(event, origin)

    if method == "POST" and raw_path == "/auth/logout":
        return logout(event, origin)

    return response(
        404,
        {"message": "route not found"},
        origin,
    )