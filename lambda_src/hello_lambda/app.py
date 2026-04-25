import json

def lambda_handler(event, context):
    return {
        "statusCode": 200,
        "body": json.dumps({
            "message": "Olá! Lambda criada com Terraform no projeto Terraform-Serverless.",
            "event_received": event
        })
    }