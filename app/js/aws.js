'use strict';

const {ipcRenderer} = require('electron');
const AWS = require('aws-sdk');
const AWS_Credentials = require('./aws-credentials');
const AWS_Config = require('./aws-config');
const nconf = require('nconf').file({file: 'config.json'});
var regionInfo = null;
var config = null;
var s3 = null;

function init() {
    // get region & endpoint
    nconf.load();
    let region = nconf.get('region');
    AWS_Config.region_available.forEach((item)=>{
        if (item.region == region) {
            regionInfo = item;
        }
    });

    // Construct AWS Configuration
    config  = new AWS.Config({
        accessKeyId: AWS_Credentials.accessKeyId, 
        secretAccessKey: AWS_Credentials.secretAccessKey, 
        region: regionInfo.region
    });

    // Instantiate AWS Services
    // S3
    s3 = new AWS.S3(config);
}

function doRecognize(filename) {
    // 1. Upload file to S3
    // 1.1 but first check the bucket existence. 
    // If error (does not exist), show error message in progress window
    s3.headBucket({Bucket: AWS_Config.s3_bucket_name_prefix + regionInfo.region}, (error, data)=>{
        if (error) {
            ipcRenderer.send('request-error', '无法上传文件：Bucket不存在于' + regionInfo.region + '<br>请联系作者并尝试更换服务器位置');
        } else {
            // exists
            console.log('exists');
        }
    });
}

module.exports = {
    init: init,
    doRecognize: doRecognize
};