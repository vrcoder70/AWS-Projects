const AWS = require('aws-sdk');
AWS.config.update({ region: process.env.REGION });
var result = {}
const sqs = new AWS.SQS({
    accessKeyId: process.env.ACCESS_KEY,
    secretAccessKey: process.env.SECRET_ACCESS_KEY,
    apiVersion: process.env.API_VERSION
});

async function receiveMsgOutputQ(resultData) {
    const params = {
        AttributeNames: ["SentTimestamp"],
        MessageAttributeNames: ["All"],
        MaxNumberOfMessages: 10,
        QueueUrl: process.env.OUTPUT_QUEUE,
        VisibilityTimeout: 20,
        WaitTimeSeconds: 0
    };

    data = await sqs.receiveMessage(params).promise();
        //await function (err, data) {
            //if (err) console.log(err);
            if (data.Messages) {
                console.log("inside data.messages");
                for (var i = 0; i < data.Messages.length; i++) {
                    var message = data.Messages[i];
                    NumOfMessages = data.Messages.length;
                    const recvData = data.Messages[i];
                    result = recvData['MessageAttributes']['output']['StringValue'].split("#");
                    imageName = result[0];
                    ans = result[1];
                    resultData[imageName] = ans;
                    removeMsgOutputQ(message);
                }
                // receiveMsgOutputQ(resultData);
            }
            // } else {
            //     setTimeout(function () {
            //         receiveMsgOutputQ(resultData);
            //     }, 10 * 1000);
            // }
       //});
    return resultData;
    
};

const sendMsgInputQ = (url) => {
    const params = {
        DelaySeconds: 0,
        MessageAttributes: {
            "S3_URL": {
                DataType: "String",
                StringValue: url
            }
        },
        MessageBody: "S3 URLs.",
        QueueUrl: process.env.INPUT_QUEUE
    };

    sqs.sendMessage(params, function (err, data) {
        if (err) {
            console.log("Error", err);
        } else {
            console.log("Success", data.MessageId);
        }
    });
}

const removeMsgOutputQ = function (message) {
    console.log("Remove message from Queue")
    sqs.deleteMessage({
        QueueUrl: process.env.OUTPUT_QUEUE,
        ReceiptHandle: message.ReceiptHandle
    }, function (err, data) {
        err && console.log(err);
    });
};
exports.receiveMsgOutputQ = receiveMsgOutputQ;
exports.sendMsgInputQ = sendMsgInputQ;
exports.result = result;
