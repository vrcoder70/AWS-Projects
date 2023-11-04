
const AWS = require('aws-sdk');
const BUCKET_NAME = process.env.INPUT_BUCKET;
AWS.config.update({region: process.env.REGION});
const path = require('path');
const fs = require('fs');
const sqsHelper = require("./sqshelper");
const pathToUploadFolder = path.resolve(__dirname, "../uploads/");
const s3 = new AWS.S3({
    accessKeyId: process.env.ACCESS_KEY,
    secretAccessKey: process.env.SECRET_ACCESS_KEY
});
async function uploadFileToS3 (fileName){
    const filePath = pathToUploadFolder + "/" + fileName;
    const fileContent = fs.readFileSync(filePath);
    const s3Params = {
        Bucket: BUCKET_NAME,
        Key: fileName,
        Body: fileContent
    };

    data = await s3.upload(s3Params).promise();
    sqsHelper.sendMsgInputQ(data.Location);
    fs.unlinkSync(filePath);  
    
};

exports.uploadFileToS3 = uploadFileToS3;