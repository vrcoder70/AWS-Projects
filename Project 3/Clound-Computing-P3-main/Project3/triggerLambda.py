import boto3
import json

def trigger_lambda(fileName):
    # Create a Lambda client
    lambda_client = boto3.client('lambda')

    # Define the input payload for the Lambda function
    # payload = {
    #     'message': 'Hello from Lambda!'
    # }


    payload = {
        "Records": [
            {
                "eventSource": "aws:s3",
                "awsRegion": "us-east-1",
                "s3": {
                    "bucket": {
                        "name": "cloud-proj2-input"
                    },
                    "object": {
                        "key": fileName
                    }
                }
            }
        ]
    }
  

    # Invoke the Lambda function
    response = lambda_client.invoke(
        FunctionName='getStudentInfo',
        InvocationType='RequestResponse',
        Payload=json.dumps(payload)
    )

    # Print the response from the Lambda function
    # print(response['Payload'].read().decode())