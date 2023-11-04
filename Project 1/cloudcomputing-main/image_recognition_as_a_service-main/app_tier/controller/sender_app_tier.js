require("dotenv").config();


const AWS = require('aws-sdk');
const shell = require('shelljs');
AWS.config.update({ region: process.env.REGION });
const fs = require('fs');
const sqs = new AWS.SQS({
  accessKeyId: process.env.ACCESS_KEY,
  secretAccessKey: process.env.SECRET_ACCESS_KEY,
  apiVersion: process.env.API_VERSION
});


const sendOutput = (output) => {
  let params = {
    DelaySeconds: 0,
    MessageAttributes: {
      'output': {
        DataType: "String",
        StringValue: output
      }
    },
    MessageBody: "SQS Response.",
    QueueUrl: process.env.OUTPUT_QUEUE
  };

  sqs.sendMessage(params, function (error, data) {
    if (error) {
      console.log("Error", error);
    } else {
      console.log("Success", data.MessageId);
      //In case of success delete the data from input queue.
      var deleteParams = require('./deleteParams.json');
      sqs.deleteMessage(deleteParams, (error, data) => { });
    }
  });
}

const bucketName = process.env.OUPUT_BUCKET;

const s3 = new AWS.S3({
  accessKeyId: process.env.ACCESS_KEY,
  secretAccessKey: process.env.SECRET_ACCESS_KEY
});

const uploadImageToS3 = (fileName) => {
  fs.readFile(fileName, (error, data) => {
    if (error) throw error;
    let params = {
      Bucket: bucketName,
      Key: fileName,
      Body: data
    };
    s3.upload(params, function (error, data) {
      if (error) {
        throw error;
      }
    });
  });
};


fs.readFile('output.txt', 'utf8', (error, data) => {
  console.log("Data recieved: " + data);
  key = data.split('#')[0]
  key = key.split('/')[1]
  value = data.split('#')[1]
  value = value.replace("\n", "").replace("\r", "");
  fileContent = '(' + key + ',' + value + ')'
  fileName = key.split('.')[0] + '.txt'
  fs.writeFile(fileName, fileContent, (error) => {
    if (error) throw error;
  })
  sendOutput(key + '#' + value)
  uploadImageToS3(fileName)
  fs.unlinkSync('output.txt')
  fs.unlinkSync(fileName)

  let receiveParams = {
    AttributeNames: [
      "SentTimestamp"
    ],
    MaxNumberOfMessages: 1,
    MessageAttributeNames: [
      "All"
    ],
    QueueUrl: process.env.INPUT_QUEUE,
    VisibilityTimeout: 10,
    WaitTimeSeconds: 20
  };

  sqs.receiveMessage(receiveParams, (error, data) => {
    if (error) {
      console.log("Error Received:- ", error);
    } else if (data.Messages) {
      shell.exec('/home/ubuntu/app_tier/app_tier.sh')
      //shell.exec('/Users/nishantchaturvedi/Documents/GitHub/cloudcomputing/image_recognition_as_a_service-main/app_tier/app_tier.sh')
    }
    else {
    }
  });

})