require("dotenv").config()
const express = require("express");
const bodyParser = require("body-parser");
const multer = require('multer');
const path = require('path');
const app = express();
const s3Helper = require("./aws-helper/s3helper");
const sqsHelper = require("./aws-helper/sqshelper");
app.use(bodyParser.json());

var resultData = {}
var resultSize = 0;

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '/uploads/'))
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname)
  }
})
var upload = multer({
  storage: storage
}).array('myfile', 1000);


async function getResultForFile(fileName){

  while(true){
    if(resultData[fileName]){
      return resultData[fileName];
    }
    var result = await sqsHelper.receiveMsgOutputQ(resultData);
    for(var key in result){

      resultData[key] = result[key];
    }
  }

}
app.post('/', async function (req, res) {
  upload(req, res, async function (err) {
    if (err) {
      console.log(err)
      return res.end("Error uploading file.");
    }
    // Reset the dictionary when user uploads new images.
    var fileName;
    for (const index in req.files) {
      console.log("File recieved :" + req.files[index].filename);
      await s3Helper.uploadFileToS3(req.files[index].filename);
      fileName = req.files[index].filename;
    }

    result = await getResultForFile(fileName);
    // res.end("File uploaded to server! Started the process for classifying images");
    res.end(result);
  });
});

app.get('/getResult', async function (req, res) {
  var result = await sqsHelper.receiveMsgOutputQ(resultData);
  resultSize = Object.keys(result).length;
  var response = {
    "numOfResults": resultSize,
    "results": result
  };
  res.end(JSON.stringify(response));
});

app.listen(3000, function () {
  console.log("Working on port 3000");
});