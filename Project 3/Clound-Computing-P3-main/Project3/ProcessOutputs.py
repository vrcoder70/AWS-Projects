from readSQS import read_sqs
import os
import boto3
import csv
map = {}

while(len(map) <= 100):
    output_sqs_queue_url = 'https://sqs.us-east-1.amazonaws.com/326339449929/sqs-output-bucket-create'
    s3 = boto3.client("s3")
    s3_filenames = read_sqs(output_sqs_queue_url)

    if (len(s3_filenames) > 0):
        for f in s3_filenames:
            # print("Filenames: "+f)
            bucketName = "cloud-proj2-output"
            objectKey = f
            pathToStore = os.path.join("/tmp", objectKey)
            s3.download_file(bucketName, objectKey, pathToStore)
            with open(pathToStore, "r") as file:
                csv_reader = csv.reader(file)
                csv_string = ""
                for row in csv_reader:
                    csv_string += ",".join(row) + "\n"

                print("Output of ", f, ": " , csv_string)
            map[f] = 1
# s3_filenames = read_sqs(output_sqs_queue_url)
