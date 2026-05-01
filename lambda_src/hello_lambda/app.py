import json
import boto3
import os

sns = boto3.client("sns")

def lambda_handler(event, context):
    topic_arn = os.environ["SNS_TOPIC_ARN"]

    print("Evento:", event)

    for record in event["Records"]:
        message = record["body"]

        print("Mensagem processada:", message)

        sns.publish(
            TopicArn=topic_arn,
            Message=f"Mensagem processada: {message}",
            Subject="Processamento SQS"
        )

    return {
        "statusCode": 200
    }