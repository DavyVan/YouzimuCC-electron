'use strict';

const {ipcRenderer} = require('electron');
const path = require('path');
const fs = require('fs');
const https = require('https');
const AWS = require('aws-sdk');
const AWS_Credentials = require('./aws-credentials');
const AWS_Config = require('./aws-config');
const nconf = require('nconf').file({file: 'config.json'});
var regionInfo = null;
var config = null;
var s3 = null;
var transcribe = null;

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
    // Transcribe
    transcribe = new AWS.TranscribeService(config);
}

function doRecognize(filename) {
    // 1. Upload file to S3
    // 1.1 but first check the bucket existence. 
    // If error (does not exist), show error message in progress window
    s3.headBucket({Bucket: AWS_Config.s3_bucket_name_prefix + regionInfo.region}, (error, data)=>{
        if (error) {
            ipcRenderer.send('request-error', '无法上传文件：Bucket不存在于' + regionInfo.region + '<br>请联系作者并尝试更换服务器位置');
        } else {
            // exists, upload file to S3
            // I use putObject() rather than upload(), because the file is usually small ~10MB
            console.log('uploading');
            s3.putObject({
                Bucket: AWS_Config.s3_bucket_name_prefix + regionInfo.region,
                Key: path.parse(filename).base,
                Body: fs.readFileSync(filename)
            }, (error, data)=>{
                if (error) {
                    ipcRenderer.send('request-error', '文件上传时出错');
                } else {
                    console.log('uploaded, request transcribe');
                    transcribe.startTranscriptionJob({
                        LanguageCode: nconf.get('language'),
                        Media: {
                            MediaFileUri: constructS3URL(AWS_Config.s3_bucket_name_prefix + regionInfo.region, regionInfo.region, path.parse(filename).base)
                        },
                        TranscriptionJobName: (encodeURI(path.parse(filename).base.replace(/ /g, '_')) + '_' + (new Date()).toISOString()).replace(/%|'|:/g, '')
                    }, checkTranscriptionJobStatusAndHandle);
                    ipcRenderer.send('request-sent');
                }
                
            });
        }
    });
}

function constructS3URL(bucket, region, filebasename) {
    return 'https://s3-' + region + '.amazonaws.com/' + bucket + '/' + filebasename;
}

function checkTranscriptionJobStatusAndHandle(error, data) {
    // if error
    if (error) {
        console.log('transcribe request error');
        console.log(error);
        ipcRenderer.send('request-error', '识别请求出错');
    } else if (data.TranscriptionJob.TranscriptionJobStatus == 'FAILED') {
        console.log('transcribe error: ' + data.TranscriptionJob.FailureReason);
        ipcRenderer.send('request-error', '识别时出错：' + data.TranscriptionJob.FailureReason);
    } else if (data.TranscriptionJob.TranscriptionJobStatus == 'IN_PROGRESS') {
        // if still in progress, re-check
        ipcRenderer.send('request-sent');
        setTimeout(() => {
            transcribe.getTranscriptionJob({
                TranscriptionJobName: data.TranscriptionJob.TranscriptionJobName
            }, checkTranscriptionJobStatusAndHandle);       // recursively
        }, 5000);       // wait for 5 seconds
    } else if (data.TranscriptionJob.TranscriptionJobStatus == 'COMPLETED') {
        // Fetch result
        ipcRenderer.send('request-receiving');
        var resultRaw = '';
        https.get(data.TranscriptionJob.Transcript.TranscriptFileUri, (res) => {
            console.log(`状态码: ${res.statusCode}`);
            res.on('data', (chunk) => {   // Receiving data
                ipcRenderer.send('request-receiving');
                console.log('Data chunk received.');
                resultRaw += chunk;
            });
            res.on('end', () => {         // All data received
                // if (req.aborted) return;
                ipcRenderer.send('request-received');
                console.log('Response end.');
                console.log(data);
                // TODO:
                // var parsedData = parseResult(resultRaw.trim());
                // ipcRenderer.send('show-result', parsedData);
            });
        });
    }
}

// TODO:
// Input: result returned from IBM Cloud.{results=[{alternatives=[{timestamps=[[,,]], confidence, transcript}], final}], result_index}
// Output: parsed result. [{start, end, transcript}]
function parseResult(result) {
    // result = require('./sampledata').trim();
    let resultObj = JSON.parse(result).results;
    var parsedResult = [];
    for (let item in resultObj) {
        item = resultObj[item].alternatives[0];
        let timestamps = item.timestamps;
        let transcript = item.transcript;
        parsedResult.push({start: timestamps[0][1], end: timestamps[timestamps.length-1][2], transcript});
    }
    return parsedResult;
}

module.exports = {
    init: init,
    doRecognize: doRecognize
};