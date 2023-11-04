from readSQS import read_sqs
from triggerLambda import trigger_lambda

map = {}
input_sqs_queue_url = 'https://sqs.us-east-1.amazonaws.com/326339449929/sqs-input-bucket-create'
output_sqs_queue_url = 'https://sqs.us-east-1.amazonaws.com/326339449929/sqs-output-bucket-create'
while( len(map)<=100):
    s3_filenames = read_sqs(input_sqs_queue_url)

    if(len(s3_filenames) > 0 ):
        for f in s3_filenames:
            # print("Filenames: "+f)
            trigger_lambda(f)
            map[f] = 1

    # xs3_filenames = read_sqs(input_sqs_queue_url)


