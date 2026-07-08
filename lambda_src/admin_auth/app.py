import base64
import hashlib
import json
import os
import secrets
from datetime import datetime, timedelta, timezone

import boto3

dynamodb = boto3.client("dynamodb")

TABLE_NAME = os.environ["TABLE_NAME"]
ALLOWED_ORIGINS = os.environ.get(
    "ALLOWED_ORIGINS",
    "https://www.cloudtrilhas.com.br,https://cloudtrilhas.com.br"
).split(",")

SESSION_HOURS = 8


def response(status_code, body, origin=None):
    allow_origin = origin if origin in ALLOWED_ORIGINS else ALLOWED_ORIGINS[0]

    return {
        "statusCode": status_code,
        "headers": {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": allow_origin,
            "Access-Control-Allow-Methods": "GET,POST,PATCH,OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type,Authorization",
        },
        "body": json.dumps(body),
    }


def now_iso():
    return datetime.now(timezone.utc).isoformat()


def hash_password(password, salt=None):
    if not salt:
        salt = base64.b64encode(secrets.token_bytes(16)).decode("utf-8")

    password_hash = hashlib.pbkdf2_hmac(
        "sha256",
        password.encode("utf-8"),
        salt.encode("utf-8"),
        100000
    )

    return salt, base64.b64encode(password_hash).decode("utf-8")


def verify_password(password, salt, stored_hash):
    _, calculated_hash = hash_password(password, salt)
    return secrets.compare_digest(calculated_hash, stored_hash)


def parse_body(event):
    body = event.get("body") or "{}"
    return json.loads(body)


def get_user(username):
    result = dynamodb.get_item(
        TableName=TABLE_NAME,
        Key={"username": {"S": username}},
        ConsistentRead=True,
    )

    return result.get("Item")


def create_session_token():
    return secrets.token_urlsafe(32)


def get_auth_username(event):
    headers = event.get("headers") or {}
    auth = headers.get("authorization") or headers.get("Authorization") or ""

    if not auth.startswith("Bearer "):
        return None

    token = auth.replace("Bearer ", "").strip()

    result = dynamodb.scan(
        TableName=TABLE_NAME,
        FilterExpression="session_token = :token",
        ExpressionAttributeValues={
            ":token": {"S": token}
        }
    )

    items = result.get("Items", [])

    if not items:
        return None

    user = items[0]
    expires_at = user.get("session_expires_at", {}).get("S", "")

    if expires_at and datetime.fromisoformat(expires_at) < datetime.now(timezone.utc):
        return None

    return user["username"]["S"]


def require_auth(event):
    username = get_auth_username(event)

    if not username:
        return None

    user = get_user(username)

    if not user:
        return None

    if user.get("active", {}).get("BOOL") is not True:
        return None

    return username


def login(event, origin):
    body = parse_body(event)

    username = body.get("username", "").strip()
    password = body.get("password", "")

    if not username or not password:
        return response(400, {"message": "username and password are required"}, origin)

    user = get_user(username)

    if not user:
        return response(401, {"message": "invalid credentials"}, origin)

    if user.get("active", {}).get("BOOL") is not True:
        return response(403, {"message": "user inactive"}, origin)

    salt = user["password_salt"]["S"]
    stored_hash = user["password_hash"]["S"]

    if not verify_password(password, salt, stored_hash):
        return response(401, {"message": "invalid credentials"}, origin)

    session_token = create_session_token()
    expires_at = datetime.now(timezone.utc) + timedelta(hours=SESSION_HOURS)

    dynamodb.update_item(
        TableName=TABLE_NAME,
        Key={"username": {"S": username}},
        UpdateExpression="""
            SET session_token = :token,
                session_expires_at = :expires,
                last_login = :last_login
        """,
        ExpressionAttributeValues={
            ":token": {"S": session_token},
            ":expires": {"S": expires_at.isoformat()},
            ":last_login": {"S": now_iso()},
        },
    )

    return response(
        200,
        {
            "message": "login successful",
            "token": session_token,
            "expires_at": expires_at.isoformat(),
            "user": {
                "username": username,
                "name": user.get("name", {}).get("S", ""),
                "email": user.get("email", {}).get("S", ""),
                "role": user.get("role", {}).get("S", "admin"),
            },
        },
        origin,
    )


def list_users(event, origin):
    if not require_auth(event):
        return response(401, {"message": "unauthorized"}, origin)

    result = dynamodb.scan(TableName=TABLE_NAME)

    users = []

    for item in result.get("Items", []):
        users.append({
            "username": item["username"]["S"],
            "name": item.get("name", {}).get("S", ""),
            "email": item.get("email", {}).get("S", ""),
            "role": item.get("role", {}).get("S", "admin"),
            "active": item.get("active", {}).get("BOOL", False),
            "created_at": item.get("created_at", {}).get("S", ""),
            "last_login": item.get("last_login", {}).get("S", ""),
        })

    return response(200, {"users": users}, origin)


def create_user(event, origin):
    if not require_auth(event):
        return response(401, {"message": "unauthorized"}, origin)

    body = parse_body(event)

    username = body.get("username", "").strip()
    password = body.get("password", "")
    name = body.get("name", "").strip()
    email = body.get("email", "").strip()
    role = body.get("role", "admin").strip()

    if not username or not password:
        return response(400, {"message": "username and password are required"}, origin)

    if get_user(username):
        return response(409, {"message": "user already exists"}, origin)

    salt, password_hash = hash_password(password)

    dynamodb.put_item(
        TableName=TABLE_NAME,
        Item={
            "username": {"S": username},
            "password_salt": {"S": salt},
            "password_hash": {"S": password_hash},
            "name": {"S": name},
            "email": {"S": email},
            "role": {"S": role},
            "active": {"BOOL": True},
            "created_at": {"S": now_iso()},
        },
    )

    return response(201, {"message": "user created", "username": username}, origin)


def update_user(event, origin):
    if not require_auth(event):
        return response(401, {"message": "unauthorized"}, origin)

    path_params = event.get("pathParameters") or {}
    username = path_params.get("username")

    if not username:
        return response(400, {"message": "username is required"}, origin)

    body = parse_body(event)

    update_parts = []
    values = {}

    if "active" in body:
        update_parts.append("active = :active")
        values[":active"] = {"BOOL": bool(body["active"])}

    if "password" in body and body["password"]:
        salt, password_hash = hash_password(body["password"])
        update_parts.append("password_salt = :salt")
        update_parts.append("password_hash = :hash")
        values[":salt"] = {"S": salt}
        values[":hash"] = {"S": password_hash}

    if not update_parts:
        return response(400, {"message": "nothing to update"}, origin)

    dynamodb.update_item(
        TableName=TABLE_NAME,
        Key={"username": {"S": username}},
        UpdateExpression="SET " + ", ".join(update_parts),
        ExpressionAttributeValues=values,
    )

    return response(200, {"message": "user updated", "username": username}, origin)


def lambda_handler(event, context):
    method = event.get("requestContext", {}).get("http", {}).get("method", "")
    path = event.get("rawPath", "")

    headers = event.get("headers") or {}
    origin = headers.get("origin") or headers.get("Origin") or ""

    if method == "OPTIONS":
        return response(200, {"message": "ok"}, origin)

    if origin and origin not in ALLOWED_ORIGINS:
        return response(403, {"message": "origin not allowed"}, origin)

    if method == "POST" and path == "/auth/login":
        return login(event, origin)

    if method == "GET" and path == "/auth/users":
        return list_users(event, origin)

    if method == "POST" and path == "/auth/users":
        return create_user(event, origin)

    if method == "PATCH" and path.startswith("/auth/users/"):
        return update_user(event, origin)

    return response(404, {"message": "route not found"}, origin)