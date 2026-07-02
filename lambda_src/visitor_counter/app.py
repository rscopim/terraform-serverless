import json
import os
import boto3

dynamodb = boto3.client("dynamodb")

TABLE_NAME = os.environ["TABLE_NAME"]

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
            "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type",
        },
        "body": json.dumps(body),
    }


def lambda_handler(event, context):
    method = event.get("requestContext", {}).get("http", {}).get("method", "")

    headers = event.get("headers") or {}
    origin = headers.get("origin") or headers.get("Origin") or ""

    if method == "OPTIONS":
        return response(200, {"message": "ok"}, origin)

    if origin and origin not in ALLOWED_ORIGINS:
        return response(403, {"message": "origin not allowed"}, origin)

    if method == "GET":
        result = dynamodb.get_item(
            TableName=TABLE_NAME,
            Key={"id": {"S": "hits"}},
            ConsistentRead=True,
        )

        count = int(result.get("Item", {}).get("count", {}).get("N", "0"))
        return response(200, {"count": count}, origin)

    if method == "POST":
        result = dynamodb.update_item(
            TableName=TABLE_NAME,
            Key={"id": {"S": "hits"}},
            UpdateExpression="ADD #count :inc",
            ExpressionAttributeNames={
                "#count": "count"
            },
            ExpressionAttributeValues={
                ":inc": {"N": "1"}
            },
            ReturnValues="UPDATED_NEW",
        )

        count = int(result["Attributes"]["count"]["N"])
        return response(200, {"count": count}, origin)

    return response(405, {"message": "method not allowed"}, origin)