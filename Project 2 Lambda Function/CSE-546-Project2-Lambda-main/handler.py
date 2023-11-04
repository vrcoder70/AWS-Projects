import boto3
import face_recognition
import pickle
import urllib
import os
import csv

from boto3.dynamodb.conditions import Key

input_bucket = "cloud-proj2-input"
output_bucket = "cloud-proj2-output"
table = "Cloudproject-2"
s3 = boto3.client("s3")
dynamodb = boto3.resource("dynamodb", region_name="us-east-1")


# Function to read the 'encoding' file
def open_encoding(filename):
	file = open(filename, "rb")
	data = pickle.load(file)
	file.close()
	return data

def getVideoFromS3(event):
	bucketName = event['Records'][0]['s3']['bucket']['name']
	objectKey = urllib.parse.unquote_plus(event['Records'][0]['s3']['object']['key'], encoding='utf-8')
	pathToStore = os.path.join("/tmp", objectKey)
	s3.download_file(bucketName, objectKey, pathToStore)
	return objectKey, pathToStore

def getFramesDirectory():
	framesDir = os.path.join("/tmp", "frames")
	if(not os.path.exists(framesDir)):
		os.mkdir(framesDir)	
	return framesDir

def getFramesFromVideo(videoPath):
	frameDir = getFramesDirectory()
	framePath = os.path.join(frameDir, "image-%3d.jpg")
	
	os.system(f"ffmpeg -i {videoPath} -r 1/1 {framePath}")
	return frameDir

def findPersonName(frame):
	knownEncodings = encodedData['encoding']
	knownNames = encodedData['name']
	img = face_recognition.load_image_file(frame)
	faceEncoding = face_recognition.face_encodings(img)[0]
	for i, knownEncoding in enumerate(knownEncodings):
		faceMatches = face_recognition.compare_faces([knownEncoding], faceEncoding)[0]
		if faceMatches:
			return knownNames[i]
		
def recognizeFirstFace(videoPath):
	frameDir = getFramesFromVideo(videoPath)
	#Loop through all the frames and stop when first face is recognized
	with os.scandir(frameDir) as frames:
		for frame in frames:
			name = findPersonName(frame.path)
			if name:
				return name

def queryDynamoDB(name):
	dbTable = dynamodb.Table(table)
	queryResult = dbTable.query(
		KeyConditionExpression=Key('name').eq(name)
	)['Items'][0]
	csvPath = "/tmp/result.csv"
	with open(csvPath, 'w', newline='') as f:
		w = csv.writer(f)
		w.writerows([[queryResult["name"], queryResult['major'], queryResult['year']]])
	
	return csvPath

def uploadResultToS3(videoName, csvPath):
	s3resource = boto3.resource('s3')
	outputBucket = s3resource.Bucket(output_bucket)
	result = open(csvPath, 'rb')
	outputBucket.put_object(Key=videoName.split('.mp4')[0], Body=result, ContentType='text/csv')

def face_recognition_handler(event, context):	
	videoName, videoPath = getVideoFromS3(event)
	personName = recognizeFirstFace(videoPath)
	csvPath = queryDynamoDB(personName)
	uploadResultToS3(videoName, csvPath)

	return {
		"statusCode": 200
	}
encodedData = open_encoding("encoding")
