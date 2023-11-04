require("dotenv").config();
const AWS = require('aws-sdk');
AWS.config.update({region: process.env.REGION});
const fs = require('fs');

const bucketName = process.env.INPUT_BUCKET;
const sqs = new AWS.SQS({
  accessKeyId: process.env.ACCESS_KEY, 
  secretAccessKey: process.env.SECRET_ACCESS_KEY, 
  apiVersion: process.env.API_VERSION});

const s3 = new AWS.S3({ 
    accessKeyId: process.env.ACCESS_KEY,
    secretAccessKey: process.env.SECRET_ACCESS_KEY,
});

const queueURL = process.env.INPUT_QUEUE;
const params = {
 AttributeNames: [
    "SentTimestamp"
 ],
 MaxNumberOfMessages: 1,
 MessageAttributeNames: [
    "All"
 ],
 QueueUrl: queueURL,
 VisibilityTimeout: 10,
 WaitTimeSeconds: 20
};


sqs.receiveMessage(params, (error, data) => {
    if (error) {
      console.log("Error Received:- ", error);
    } else if (data.Messages) {
        var deleteParams = {
          QueueUrl: queueURL,
          ReceiptHandle: data.Messages[0].ReceiptHandle
        };
        s3Url = data.Messages[0].MessageAttributes.S3_URL.StringValue
        s3ImageName = s3Url.split('/')
        imageName = s3ImageName[s3ImageName.length - 1]
        downloadImageFromS3(imageName)
        //Add delete params to a file
        fs.writeFile("./deleteParams.json", JSON.stringify(deleteParams), (err) => err && console.error(err));
        //sqs.deleteMessage(deleteParams, (error, data) => {});
    }
});



const downloadImageFromS3 = (fileName) => {
  let params = {
      Key: fileName,
      Bucket: bucketName
  }
  s3.getObject(params, (error, data) =>{
      if (error) {
          throw error
      }
      if (data.Body){
        fs.writeFileSync('/home/ubuntu/app_tier/classifier/'+fileName, data.Body)
        //fs.writeFileSync('/Users/nishantchaturvedi/Documents/GitHub/cloudcomputing/image_recognition_as_a_service-main/app_tier/classifier/'+fileName, data.Body)
      }
  })
};
