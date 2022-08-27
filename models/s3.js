require('dotenv').config();
const fs = require('fs');
const S3 = require("aws-sdk/clients/s3");
const AWS = require('aws-sdk')

const bucketName = process.env.AWS_BUCKET_NAME;
const region = process.env.AWS_BUCKET_REGION
const accessKey = process.env.AWS_ACCESS_KEY
const secretKey = process.env.AWS_SECRET_KEY



// aws.config.update({
//     accessKeyId: process.env.AWSAccessKeyId,
//     secretAccessKey: process.env.AWSSecretKey,
//     region: process.env.AWSRegion,
//     });
AWS.config.update({
    accessKeyId: accessKey,
    secretAccessKey: secretKey,
    region: region,
})

const s3 = new AWS.S3({})

//uploads file to S3
function uploadFile(file) {
    const fileStream = fs.createReadStream(file.path);
    const uploadParams = {
        Bucket: bucketName,
        Body: fileStream,
        Key: file.filename
    }
    return s3.upload(uploadParams).promise();
}
exports.uploadFile = uploadFile;

//download files from S3