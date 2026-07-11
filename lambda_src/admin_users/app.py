import base64
import hashlib
import json
import os
import re
import secrets
from datetime import datetime, timedelta, timezone

import boto3

dynamodb = boto3.client("dynamodb")

USERS_TABLE = os.environ["USERS_TABLE"]
SESSIONS_TABLE = os.environ["SESSIONS_TABLE"]

SESSION_IDLE_MINUTES = int(
    os.environ.get("SESSION_IDLE_MINUTES", "30")
)

SESSION_MAX_HOURS = int(
    os.environ.get("SESSION_MAX_HOURS", "8")
)

PASSWORD_ITERATIONS = 210_000

VALID_ROLES = {
    "ADMIN",
    "EDITOR",
    "VIEWER",
}

VALID_STATUS = {
    "ACTIVE",
    "DISABLED",
    "BLOCKED",
}

ALLOWED_ORIGINS = [
    origin.strip()
    for origin in os.environ.get(
        "ALLOWED_ORIGINS",
        "https://www.cloudtrilhas.com.br,https://cloudtrilhas.com.br",
    ).split(",")
    if origin.strip()
]


# ======================================================
# Resposta HTTP padronizada.
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
            "Access-Control-Allow-Methods": (
                "GET,POST,PATCH,OPTIONS"
            ),
            "Access-Control-Allow-Headers": (
                "Content-Type,Authorization"
            ),
            "Cache-Control": "no-store",
            "Pragma": "no-cache",
        },
        "body": json.dumps(body),
    }


def now_utc():
    return datetime.now(timezone.utc)


def now_iso():
    return now_utc().isoformat()


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
# Senhas administrativas.
# ======================================================
def generate_password_hash(password):
    salt = base64.b64encode(
        secrets.token_bytes(16)
    ).decode("utf-8")

    password_hash = hashlib.pbkdf2_hmac(
        "sha256",
        password.encode("utf-8"),
        salt.encode("utf-8"),
        PASSWORD_ITERATIONS,
    )

    return (
        salt,
        base64.b64encode(
            password_hash
        ).decode("utf-8"),
    )


def hash_session_token(token):
    return hashlib.sha256(
        token.encode("utf-8")
    ).hexdigest()


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


def get_bearer_token(event):
    headers = event.get("headers") or {}

    authorization = (
        headers.get("authorization")
        or headers.get("Authorization")
        or ""
    )

    if not authorization.startswith("Bearer "):
        return None

    token = authorization.removeprefix(
        "Bearer "
    ).strip()

    return token or None


# ======================================================
# Valida e renova uma sessão administrativa.
#
# A renovação nunca ultrapassa absolute_expires_at.
# ======================================================
def get_authenticated_user(event):
    token = get_bearer_token(event)

    if not token:
        return None

    token_hash = hash_session_token(token)

    session_result = dynamodb.get_item(
        TableName=SESSIONS_TABLE,
        Key={
            "token_hash": {
                "S": token_hash
            }
        },
        ConsistentRead=True,
    )

    session = session_result.get("Item")

    if not session:
        return None

    current_time = now_utc()
    current_timestamp = int(
        current_time.timestamp()
    )

    idle_expires_at = int(
        session.get(
            "expires_at",
            {"N": "0"},
        )["N"]
    )

    absolute_expires_at = int(
        session.get(
            "absolute_expires_at",
            {"N": "0"},
        )["N"]
    )

    if (
        idle_expires_at <= current_timestamp
        or absolute_expires_at <= current_timestamp
    ):
        return None

    username = session.get(
        "username",
        {},
    ).get("S", "")

    if not username:
        return None

    user = get_user(username)

    if not user:
        return None

    if (
        user.get(
            "status",
            {},
        ).get("S", "DISABLED")
        != "ACTIVE"
    ):
        return None

    renewed_expiration = current_time + timedelta(
        minutes=SESSION_IDLE_MINUTES
    )

    absolute_expiration_datetime = (
        datetime.fromtimestamp(
            absolute_expires_at,
            tz=timezone.utc,
        )
    )

    if renewed_expiration > absolute_expiration_datetime:
        renewed_expiration = (
            absolute_expiration_datetime
        )

    dynamodb.update_item(
        TableName=SESSIONS_TABLE,
        Key={
            "token_hash": {
                "S": token_hash
            }
        },
        UpdateExpression=(
            "SET last_activity = :last_activity, "
            "expires_at = :expires_at"
        ),
        ExpressionAttributeValues={
            ":last_activity": {
                "S": current_time.isoformat()
            },
            ":expires_at": {
                "N": str(
                    int(
                        renewed_expiration.timestamp()
                    )
                )
            },
        },
        ConditionExpression=(
            "attribute_exists(token_hash)"
        ),
    )

    return user


def require_admin(event):
    user = get_authenticated_user(event)

    if not user:
        return None

    if (
        user.get(
            "role",
            {},
        ).get("S", "")
        != "ADMIN"
    ):
        return None

    return user


def serialize_user(item):
    return {
        "username": item["username"]["S"],
        "name": item.get(
            "name",
            {},
        ).get("S", ""),
        "email": item.get(
            "email",
            {},
        ).get("S", ""),
        "role": item.get(
            "role",
            {},
        ).get("S", "VIEWER"),
        "status": item.get(
            "status",
            {},
        ).get("S", "DISABLED"),
        "created_at": item.get(
            "created_at",
            {},
        ).get("S", ""),
        "created_by": item.get(
            "created_by",
            {},
        ).get("S", ""),
        "last_login": item.get(
            "last_login",
            {},
        ).get("S", ""),
        "password_changed_at": item.get(
            "password_changed_at",
            {},
        ).get("S", ""),
    }


# ======================================================
# O Scan é utilizado somente para a listagem administrativa.
# ======================================================
def scan_all_users():
    items = []

    scan_kwargs = {
        "TableName": USERS_TABLE,
    }

    while True:
        result = dynamodb.scan(
            **scan_kwargs
        )

        items.extend(
            result.get("Items", [])
        )

        last_key = result.get(
            "LastEvaluatedKey"
        )

        if not last_key:
            break

        scan_kwargs["ExclusiveStartKey"] = (
            last_key
        )

    return items


def list_users(event, origin):
    authenticated_user = require_admin(event)

    if not authenticated_user:
        return response(
            401,
            {"message": "unauthorized"},
            origin,
        )

    users = [
        serialize_user(item)
        for item in scan_all_users()
    ]

    users.sort(
        key=lambda user: user["username"]
    )

    return response(
        200,
        {"users": users},
        origin,
    )


def validate_username(username):
    return bool(
        re.fullmatch(
            r"[a-z0-9._-]{3,50}",
            username,
        )
    )


def validate_password(password):
    return (
        len(password) >= 10
        and any(
            character.isupper()
            for character in password
        )
        and any(
            character.islower()
            for character in password
        )
        and any(
            character.isdigit()
            for character in password
        )
    )


def create_user(event, origin):
    authenticated_user = require_admin(event)

    if not authenticated_user:
        return response(
            401,
            {"message": "unauthorized"},
            origin,
        )

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

    name = str(
        body.get("name", "")
    ).strip()

    email = str(
        body.get("email", "")
    ).strip().lower()

    role = str(
        body.get("role", "VIEWER")
    ).strip().upper()

    if not validate_username(username):
        return response(
            400,
            {
                "message": (
                    "username must contain 3 to 50 "
                    "lowercase letters, numbers, dots, "
                    "hyphens or underscores"
                )
            },
            origin,
        )

    if not validate_password(password):
        return response(
            400,
            {
                "message": (
                    "password must have at least "
                    "10 characters, uppercase, "
                    "lowercase and number"
                )
            },
            origin,
        )

    if role not in VALID_ROLES:
        return response(
            400,
            {"message": "invalid role"},
            origin,
        )

    if get_user(username):
        return response(
            409,
            {"message": "user already exists"},
            origin,
        )

    salt, password_hash = (
        generate_password_hash(password)
    )

    created_by = (
        authenticated_user["username"]["S"]
    )

    timestamp = now_iso()

    try:
        dynamodb.put_item(
            TableName=USERS_TABLE,
            Item={
                "username": {
                    "S": username
                },
                "password_salt": {
                    "S": salt
                },
                "password_hash": {
                    "S": password_hash
                },
                "password_iterations": {
                    "N": str(
                        PASSWORD_ITERATIONS
                    )
                },
                "name": {
                    "S": name
                },
                "email": {
                    "S": email
                },
                "role": {
                    "S": role
                },
                "status": {
                    "S": "ACTIVE"
                },
                "created_at": {
                    "S": timestamp
                },
                "created_by": {
                    "S": created_by
                },
                "password_changed_at": {
                    "S": timestamp
                },
            },
            ConditionExpression=(
                "attribute_not_exists(username)"
            ),
        )
    except dynamodb.exceptions.ConditionalCheckFailedException:
        return response(
            409,
            {"message": "user already exists"},
            origin,
        )

    return response(
        201,
        {
            "message": "user created",
            "username": username,
        },
        origin,
    )


def update_user(event, origin):
    authenticated_user = require_admin(event)

    if not authenticated_user:
        return response(
            401,
            {"message": "unauthorized"},
            origin,
        )

    path_parameters = (
        event.get("pathParameters") or {}
    )

    username = str(
        path_parameters.get(
            "username",
            "",
        )
    ).strip().lower()

    if not username:
        return response(
            400,
            {"message": "username is required"},
            origin,
        )

    if not get_user(username):
        return response(
            404,
            {"message": "user not found"},
            origin,
        )

    body = parse_body(event)

    if body is None:
        return response(
            400,
            {"message": "invalid JSON body"},
            origin,
        )

    update_parts = []
    values = {}
    names = {}

    if "status" in body:
        status = str(
            body["status"]
        ).strip().upper()

        if status not in VALID_STATUS:
            return response(
                400,
                {"message": "invalid status"},
                origin,
            )

        names["#status"] = "status"

        values[":status"] = {
            "S": status
        }

        update_parts.append(
            "#status = :status"
        )

    if "role" in body:
        role = str(
            body["role"]
        ).strip().upper()

        if role not in VALID_ROLES:
            return response(
                400,
                {"message": "invalid role"},
                origin,
            )

        values[":role"] = {
            "S": role
        }

        update_parts.append(
            "role = :role"
        )

    password = str(
        body.get("password", "")
    )

    if password:
        if not validate_password(password):
            return response(
                400,
                {
                    "message": (
                        "password must have at least "
                        "10 characters, uppercase, "
                        "lowercase and number"
                    )
                },
                origin,
            )

        salt, password_hash = (
            generate_password_hash(password)
        )

        values[":password_salt"] = {
            "S": salt
        }

        values[":password_hash"] = {
            "S": password_hash
        }

        values[":password_iterations"] = {
            "N": str(PASSWORD_ITERATIONS)
        }

        values[":password_changed_at"] = {
            "S": now_iso()
        }

        update_parts.extend([
            "password_salt = :password_salt",
            "password_hash = :password_hash",
            (
                "password_iterations = "
                ":password_iterations"
            ),
            (
                "password_changed_at = "
                ":password_changed_at"
            ),
        ])

    if not update_parts:
        return response(
            400,
            {"message": "nothing to update"},
            origin,
        )

    update_kwargs = {
        "TableName": USERS_TABLE,
        "Key": {
            "username": {
                "S": username
            }
        },
        "UpdateExpression": (
            "SET " + ", ".join(update_parts)
        ),
        "ExpressionAttributeValues": values,
    }

    if names:
        update_kwargs[
            "ExpressionAttributeNames"
        ] = names

    dynamodb.update_item(
        **update_kwargs
    )

    return response(
        200,
        {
            "message": "user updated",
            "username": username,
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

    if method == "GET":
        return list_users(event, origin)

    if method == "POST":
        return create_user(event, origin)

    if method == "PATCH":
        return update_user(event, origin)

    return response(
        405,
        {"message": "method not allowed"},
        origin,
    )