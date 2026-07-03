import json
import os
from datetime import date, timedelta

import boto3

ce = boto3.client("ce")

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

        if amount > 0:
            services[service] = round(amount, 2)

    return dict(sorted(services.items(), key=lambda item: item[1], reverse=True))


def get_daily_costs(start, end):
    result = ce.get_cost_and_usage(
        TimePeriod={
            "Start": start,
            "End": end,
        },
        Granularity="DAILY",
        Metrics=["UnblendedCost"],
    )

    daily = {}

    for item in result.get("ResultsByTime", []):
        day = item["TimePeriod"]["Start"]
        amount = float(item["Total"]["UnblendedCost"]["Amount"])
        daily[day] = round(amount, 2)

    return daily


def lambda_handler(event, context):
    method = event.get("requestContext", {}).get("http", {}).get("method", "")

    headers = event.get("headers") or {}
    origin = headers.get("origin") or headers.get("Origin") or ""

    if method == "OPTIONS":
        return response(200, {"message": "ok"}, origin)

    if origin and origin not in ALLOWED_ORIGINS:
        return response(403, {"message": "origin not allowed"}, origin)

    if method != "GET":
        return response(405, {"message": "method not allowed"}, origin)

    start, end = get_period()

    services = get_total_by_service(start, end)
    daily = get_daily_costs(start, end)

    total = round(sum(services.values()), 2)

    return response(
        200,
        {
            "total": total,
            "period": f"{start} a {end}",
            "services": services,
            "daily": daily,
        },
        origin,
    )