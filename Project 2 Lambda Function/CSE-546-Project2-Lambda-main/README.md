# CSE 546 - Matrix Project-2 Report

Authors:
- Vraj Rana 
- Satya Pranay Manas Nunna 
- Nishant Chaturvedi 

## Problem Statement

The objective of this project is to create an elastic application using the PaaS cloud, specifically Amazon Lambda and other AWS services. This application serves as a smart classroom aide for teachers. The assistant collects videos from the user's classroom, applies facial recognition to the videos, identifies students, and sends the relevant academic data for each student to the user.

## Design and Implementation

### 2.1 Architecture

**Architecture Description:**

This project follows the architecture outlined below:

1. A testing script uploads video clips into the input bucket (S3 - `cloud-proj2-input`).
2. A Lambda function is triggered for every insert into the input bucket.
3. The Lambda function executes a Python script, which performs facial recognition on the video frames. When the script identifies a person's face, it stops searching the frames and queries DynamoDB for relevant details.
4. After fetching the necessary details from DynamoDB, the script appends the file name, the identified person's name, and the details into a CSV file.
5. The Lambda function uploads the CSV file to the output S3 bucket (S3 - `cloud-proj2-output`).
6. The result is returned to the user, and this process is repeated for all video requests.

### 3. Code and Installation

The Lambda function is created using a Docker image, and its configuration is defined in the Dockerfile. All the dependencies needed by the Lambda function are specified in the requirements.txt file. The `handler.py` file serves as the entry point for the Lambda function and is responsible for processing video requests.

**Implementation:**

- `handler.py`:
  - `face_recognition_handler`: This is the main handler function of the Lambda function. It is called every time the function is triggered. It processes the videos uploaded to the S3 input bucket (`cloud-proj2-input`).
  - `getVideoFromS3`: This function extracts information about the video file from the event parameter, downloads the file from the S3 bucket, and stores it locally for further processing.
  - `getFramesFromVideo`: Using the video stored in the temporary location, this function utilizes the FFmpeg library to extract all frames from the video and stores the images locally in a temporary directory.
  - `recognizeFirstFace`: This function iterates over all the frames extracted from the video and calls `findPersonName` to return the name of the first identified person.
  - `findPersonName`: This function utilizes the `face_recognition` Python library to get the encoding of the first identified face. It compares this encoding with the encoding file containing information about known faces along with their names and returns the name of the identified person.
  - `queryDynamoDB`: This function accepts a name as an argument and queries DynamoDB to fetch the major and year information about the person from the database. It then stores this information locally in a CSV file.
  - `uploadResultToS3`: This function uploads the output CSV file generated in the previous steps to the S3 output bucket (`cloud-proj2-output`).

**Testing:**

- We tested the code for loading data into DynamoDB.
- We tested the `queryDynamoDB` function, which takes a name as input and generates a CSV file as output with academic information.
- We integrated the code with the entire application and tested the Lambda function's role in generating the final output in the S3 output bucket.
- We tested the entire application using the workload generator to ensure that it produces the expected output within 7 minutes for 100 requests.

### 5. Individual Contributions

#### 5.1 Vraj Rana (1225420989)

**Design:**
- Collaborated in architecture discussions and finalized the roles and responsibilities of each team member.
- Configured the AWS DynamoDB and developed the logic for generating academic output to feed into the S3 output bucket.

**Implementation:**
- Created the DynamoDB table `Cloudproject-2` with the required fields and a primary key.
- Implemented code to upload data into the DynamoDB table.
- Developed a function, `queryDynamoDB`, to query the `Cloudproject-2` table for major and year details based on a person's name.
- Programmed to store the academic information in a CSV file for S3 retrieval.

**Testing:**
- Tested the code for uploading data into DynamoDB.
- Tested the `queryDynamoDB` function, which retrieves academic information and generates a CSV file.
- Integrated the code into the application and conducted performance testing to ensure the Lambda function worked as expected.

#### 5.2 Satya Pranay Manas Nunna (1225038204)

**Design:**
- Participated in architecture discussions and finalized the roles and responsibilities of each team member.
- Responsible for creating the S3 buckets, fetching video data from MP4 files, identifying frames, and uploading the generated CSV file to the output S3 bucket.

**Implementation:**
- Created S3 buckets for input and output data.
- Developed a function to fetch video data from the S3 buckets and extract the first identified face from the video frames.
- Created a function to upload the resulting CSV file to the output S3 bucket.
- Wrote the architectural description in the report and summarized individual contributions.

**Testing:**
- Tested the function responsible for extracting video frames from MP4 files.
- Checked the part of the code that uploads the generated CSV file to the output bucket.
- Tested the entire application by triggering a script to upload 100 MP4 files to the input S3 bucket and resolved any issues that arose during code integration.

#### 5.3 Nishant Chaturvedi (1222296088)

**Design:**
- Participated in group discussions to finalize the project's design, including individual goals and responsibilities.
- Responsibilities included creating the Lambda function using a Docker image, configuring the Lambda function, and implementing the logic for face recognition in uploaded videos.

**Implementation:**
- Studied the creation of a Lambda function using a Docker image and the steps involved in configuring the Elastic Container Registry (ECR).
- Set up Docker locally to test the image creation and first image push to anticipate potential problems.
- Implemented the Lambda function's main entry point, `handler.py`, which includes the logic to recognize faces from video uploads.
- Created the final image of the Lambda function and pushed it to the ECR registry.
- Created the Lambda function from the ECR image and configured it to trigger when data is uploaded to the S3 bucket.

**Testing:**
- Tested the Lambda function's individual testing functionality to verify its implementation.
- Participated in integration testing to ensure that all components of the application worked properly and measured the performance metrics.
- Experimented with different Lambda function configurations by adjusting memory and storage settings to improve performance.