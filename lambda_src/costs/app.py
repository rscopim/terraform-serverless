import json
import os
from datetime import date, datetime, timedelta, timezone

import boto3

ce = boto3.client("ce")
dynamodb = boto3.client("dynamodb")

CACHE_TABLE = os.environ["CACHE_TABLE"]

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
            "Access-Control-Allow-Methods": "GET,OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type",
        },
        "body": json.dumps(body),
    }


def get_period():
    today = date.today()
    start = today.replace(day=1)
    end = today + timedelta(days=1)

    return start.isoformat(), end.isoformat()


def get_total_by_service(start, end):
    result = ce.get_cost_and_usage(
        TimePeriod={
            "Start": start,
            "End": end,
        },
        Granularity="MONTHLY",
        Metrics=["UnblendedCost"],
        Filter={
            "Tags": {
                "Key": "Project",
                "Values": ["Terraform-Serverless"]
            }
        },
        GroupBy=[
            {
                "Type": "DIMENSION",
                "Key": "SERVICE",
            }
        ],
    )

    services = {}

    for group in result["ResultsByTime"][0].get("Groups", []):
        service = group["Keys"][0]
        amount = float(group["Metrics"]["UnblendedCost"]["Amount"])
        rounded = round(amount, 2)

        if rounded > 0:
            services[service] = rounded

    return dict(sorted(services.items(), key=lambda item: item[1], reverse=True))


def get_daily_costs(start, end):
    result = ce.get_cost_and_usage(
        TimePeriod={
            "Start": start,
            "End": end,
        },
        Granularity="DAILY",
        Metrics=["UnblendedCost"],
        Filter={
            "Tags": {
                "Key": "Project",
                "Values": ["Terraform-Serverless"]
            }
        },
    )

    daily = {}

    for item in result.get("ResultsByTime", []):
        day = item["TimePeriod"]["Start"]
        amount = float(item["Total"]["UnblendedCost"]["Amount"])
        rounded = round(amount, 2)

        if rounded > 0:
            daily[day] = rounded

    return daily


def build_costs_payload():
    start, end = get_period()
    display_end = (date.fromisoformat(end) - timedelta(days=1)).isoformat()

    services = get_total_by_service(start, end)
    daily = get_daily_costs(start, end)

    total = round(sum(services.values()), 2)

    return {
        "total": total,
        "period": f"{start} a {display_end}",
        "services": services,
        "daily": daily,
        "last_updated": datetime.now(timezone.utc).isoformat(),
        "source": "aws-cost-explorer",
        "cache": "weekly"
    }


def save_cache(payload):
    dynamodb.put_item(
        TableName=CACHE_TABLE,
        Item={
            "id": {"S": "current"},
            "payload": {"S": json.dumps(payload)},
            "last_updated": {"S": payload["last_updated"]},
        },
    )


def load_cache():
    result = dynamodb.get_item(
        TableName=CACHE_TABLE,
        Key={
            "id": {"S": "current"}
        },
        ConsistentRead=True,
    )

    item = result.get("Item")

    if not item:
        return None

    return json.loads(item["payload"]["S"])


def refresh_cache():
    payload = build_costs_payload()
    save_cache(payload)
    return payload


def is_eventbridge_event(event):
    return event.get("source") == "eventbridge" or event.get("action") == "refresh_costs_cache"


def lambda_handler(event, context):
    if is_eventbridge_event(event):
        payload = refresh_cache()
        return {
            "statusCode": 200,
            "body": json.dumps({
                "message": "costs cache refreshed",
                "last_updated": payload["last_updated"]
            }),
        }

    method = event.get("requestContext", {}).get("http", {}).get("method", "")

    headers = event.get("headers") or {}
    origin = headers.get("origin") or headers.get("Origin") or ""

    if method == "OPTIONS":
        return response(200, {"message": "ok"}, origin)

    if origin and origin not in ALLOWED_ORIGINS:
        return response(403, {"message": "origin not allowed"}, origin)

    if method != "GET":
        return response(405, {"message": "method not allowed"}, origin)

    cached = load_cache()

    if cached:
        return response(200, cached, origin)

    payload = refresh_cache()
    return response(200, payload, origin)