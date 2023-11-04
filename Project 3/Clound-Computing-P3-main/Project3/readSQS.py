import boto3
import json 
def read_sqs(queue_url):
    # Create SQS client
    sqs = boto3.client('sqs')

    # Get URL of SQS queue
    # queue_url = 'https://sqs.us-east-1.amazonaws.com/326339449929/sqs-input-bucket-create'
    # Receive messages from the queue
    response = sqs.receive_message(
        QueueUrl=queue_url,
        MaxNumberOfMessages=10,  # maximum number of messages to receive
        VisibilityTimeout=30,    # visibility timeout in seconds
        WaitTimeSeconds=20       # long polling wait time in seconds
    )
    fileNames = []
    # Print received messages
    for message in response.get('Messages', []):
        # print('Message ID:', message['MessageId'])
        # print('Message Body:', message['Body'])
        try:
            fileName = json.loads( message['Body'])['Records'][0]['s3']['object']['key'];
        except:
            continue
        fileNames.append(fileName)
        # print(fileNames)
        # Delete the message from the queue
        sqs.delete_message(
            QueueUrl=queue_url,
            ReceiptHandle=message['ReceiptHandle']
        )
    return fileNames

# readSQS('https://sqs.us-east-1.amazonaws.com/326339449929/sqs-input-bucket-create')