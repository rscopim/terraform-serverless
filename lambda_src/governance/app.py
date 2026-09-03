import json
import os

import boto3

tagging = boto3.client("resourcegroupstaggingapi")
cloudwatch = boto3.client("cloudwatch")

ALLOWED_ORIGINS = os.environ.get(
    "ALLOWED_ORIGINS",
    "https://www.cloudtrilhas.com.br,https://cloudtrilhas.com.br"
).split(",")

REQUIRED_TAGS = ["Project", "Environment", "ManagedBy"]
PROJECT_TAG_VALUE = "Terraform-Serverless"


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


def get_resource_name(arn):
    return arn.split("/")[-1].split(":")[-1]


def get_service_from_arn(arn):
    parts = arn.split(":")
    return parts[2] if len(parts) > 2 else "unknown"


def get_resources():
    resources = []
    paginator = tagging.get_paginator("get_resources")

    for page in paginator.paginate(
        TagFilters=[
            {
                "Key": "Project",
                "Values": [PROJECT_TAG_VALUE]
            }
        ]
    ):
        for item in page.get("ResourceTagMappingList", []):
            arn = item.get("ResourceARN", "")
            tags = {tag["Key"]: tag["Value"] for tag in item.get("Tags", [])}

            missing_tags = [
                tag for tag in REQUIRED_TAGS
                if tag not in tags or not tags[tag]
            ]

            resources.append({
                "arn": arn,
                "service": get_service_from_arn(arn),
                "name": get_resource_name(arn),
                "tags": tags,
                "missing_tags": missing_tags,
                "compliant": len(missing_tags) == 0
            })

    return resources


def get_alarms():
    """Resumo dos alarmes CloudWatch do projeto (saude operacional).

    Estados possiveis por alarme: OK, ALARM, INSUFFICIENT_DATA.
    Retorna a lista e um resumo agregado para o painel administrativo.
    """
    alarms = []
    paginator = cloudwatch.get_paginator("describe_alarms")

    for page in paginator.paginate(AlarmTypes=["MetricAlarm", "CompositeAlarm"]):
        for item in page.get("MetricAlarms", []) + page.get("CompositeAlarms", []):
            name = item.get("AlarmName", "")
            # Considera apenas alarmes do projeto (por prefixo de nome)
            if PROJECT_TAG_VALUE.lower() not in name.lower():
                continue
            alarms.append({
                "name": name,
                "state": item.get("StateValue", "INSUFFICIENT_DATA"),
                "reason": item.get("StateReason", ""),
                "metric": item.get("MetricName", ""),
            })

    alarms.sort(key=lambda a: (a["state"] != "ALARM", a["name"]))

    in_alarm = sum(1 for a in alarms if a["state"] == "ALARM")
    ok = sum(1 for a in alarms if a["state"] == "OK")
    no_data = sum(1 for a in alarms if a["state"] == "INSUFFICIENT_DATA")

    return {
        "summary": {
            "total": len(alarms),
            "ok": ok,
            "in_alarm": in_alarm,
            "insufficient_data": no_data,
            "healthy": in_alarm == 0,
        },
        "alarms": alarms,
    }


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

    resources = get_resources()

    compliant = sum(1 for resource in resources if resource["compliant"])
    non_compliant = len(resources) - compliant

    # Saude operacional (alarmes CloudWatch). Falha aqui nao derruba a
    # governanca — retorna alarms=None e o painel mostra "indisponivel".
    try:
        alarms = get_alarms()
    except Exception as error:  # noqa: BLE001
        print(f"Erro ao consultar alarmes CloudWatch: {error}")
        alarms = None

    return response(
        200,
        {
            "summary": {
                "total": len(resources),
                "compliant": compliant,
                "non_compliant": non_compliant,
                "required_tags": REQUIRED_TAGS,
                "project": PROJECT_TAG_VALUE
            },
            "resources": resources,
            "alarms": alarms
        },
        origin,
    )