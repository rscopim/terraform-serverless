import base64
import hashlib
import json
import os
import secrets
from datetime import datetime, timedelta, timezone

import boto3

dynamodb = boto3.client("dynamodb")

TABLE_NAME = os.environ["TABLE_NAME"]
SESSION_HOURS = 8

ALLOWED_ORIGINS = os.environ.get(
    "ALLOWED_ORIGINS",
    "https://www.cloudtrilhas.com.br,https://cloudtrilhas.com.br"
).split(",")


def response(status_code, body, origin=None):
    allow_origin = origin if origin in ALLOWED_ORIGINS else ALLOWED_ORIGINS[0]

    return {
        "statusCode": status_code,
        "headers": {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": allow_origin,
            "Access-Control-Allow-Methods": "POST,OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type,Authorization",
        },
        "body": json.dumps(body),
    }


def parse_body(event):
    body = event.get("body") or "{}"
    return json.loads(body)


def now_iso():
    return datetime.now(timezone.utc).isoformat()


def hash_password(password, salt):
    password_hash = hashlib.pbkdf2_hmac(
        "sha256",
        password.encode("utf-8"),
        salt.encode("utf-8"),
        100000
    )

    return base64.b64encode(password_hash).decode("utf-8")


def verify_password(password, salt, stored_hash):
    calculated_hash = hash_password(password, salt)
    return secrets.compare_digest(calculated_hash, stored_hash)


def get_user(username):
    result = dynamodb.get_item(
        TableName=TABLE_NAME,
        Key={"username": {"S": username}},
        ConsistentRead=True,
    )

    return result.get("Item")


def create_session_token():
    return secrets.token_urlsafe(32)


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


def lambda_handler(event, context):
    method = event.get("requestContext", {}).get("http", {}).get("method", "")

    headers = event.get("headers") or {}
    origin = headers.get("origin") or headers.get("Origin") or ""

    if method == "OPTIONS":
        return response(200, {"message": "ok"}, origin)

    if origin and origin not in ALLOWED_ORIGINS:
        return response(403, {"message": "origin not allowed"}, origin)

    if method != "POST":
        return response(405, {"message": "method not allowed"}, origin)

    return login(event, origin)