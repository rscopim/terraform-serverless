import boto3
import os

cloudwatch = boto3.client("cloudwatch")

NAMESPACE = os.environ.get("METRIC_NAMESPACE", "TerraformServerless/Downloads")

def lambda_handler(event, context):
    print("Evento recebido:", event)

    detail = event.get("detail", {})
    request_parameters = detail.get("requestParameters", {})

    bucket_name = request_parameters.get("bucketName", "unknown")
    object_key = request_parameters.get("key", "unknown")

    print(f"Download detectado: s3://{bucket_name}/{object_key}")

    cloudwatch.put_metric_data(
        Namespace=NAMESPACE,
        MetricData=[
            {
                "MetricName": "PDFDownloads",
                "Dimensions": [
                    {
                        "Name": "BucketName",
                        "Value": bucket_name
                    },
                    {
                        "Name": "ObjectKey",
                        "Value": object_key
                    }
                ],
                "Value": 1,
                "Unit": "Count"
            }
        ]
    )

    return {
        "statusCode": 200,
        "message": "Métrica registrada com sucesso"
    }