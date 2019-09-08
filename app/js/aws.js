'use strict';

const AWS = require('aws-sdk');
const AWS_Credentials = require('./aws-credentials');
const AWS_Config = require('./aws-config');

var config  = new AWS.Config({
    accessKeyId: AWS_Credentials.accessKeyId, 
    secretAccessKey: AWS_Credentials.secretAccessKey, 
    region: AWS_Config.region_default.region
});

var s3 = null;

function doRecognize(filename) {
    // 1. Upload file to S3
    // 1.0 Initialize
    if (s3 === null) {
        s3 = new AWS.S3(config);
    } 

    // 1.1 but first check the bucket existence. Create if necessary.
    s3.headBucket({Bucket: AWS_Config.s3_bucket_name_input}, (error, data)=>{
        if (error) console.log(error, error.stack);
        else console.log(data);
    });
}