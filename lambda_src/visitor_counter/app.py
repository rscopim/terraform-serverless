import json
import os
import boto3

dynamodb = boto3.client("dynamodb")

TABLE_NAME = os.environ["TABLE_NAME"]
ALLOWED_ORIGIN = os.environ.get("ALLOWED_ORIGIN", "https://www.cloudtrilhas.com.br")


def response(status_code, body):
    return {
        "statusCode": status_code,
        "headers": {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
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
        return response(200, {"message": "ok"})

    if origin and origin != ALLOWED_ORIGIN:
        return response(403, {"message": "origin not allowed"})

    if method == "GET":
        result = dynamodb.get_item(
            TableName=TABLE_NAME,
            Key={"id": {"S": "hits"}},
            ConsistentRead=True,
        )

        count = int(result.get("Item", {}).get("count", {}).get("N", "0"))
        return response(200, {"count": count})

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
        return response(200, {"count": count})

    return response(405, {"message": "method not allowed"})