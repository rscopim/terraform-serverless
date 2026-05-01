import json

def lambda_handler(event, context):
    print("Evento completo:", event)

    for record in event["Records"]:
        print("Mensagem recebida:", record["body"])

    return {
        "statusCode": 200
    }