'use strict';

const {ipcRenderer, remote} = require('electron');
const {app} = remote;
const path = require('path');
const fs = require('fs');
const https = require('https');
const AWS = require('aws-sdk');
const AWS_Credentials = require('./aws-credentials');
const AWS_Config = require('./aws-config');
const nconf = require('nconf').file({file: app.getAppPath() + '/config.json'});
var regionInfo = null;
var config = null;
var s3 = null;
var transcribe = null;
const endPunctuations = ['.', '?', '!'];

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
    // debug
    // let result = require('./asrOutput');
    // result = parseResult(result);
    // console.log(result);
    // ipcRenderer.send('show-result', result);
    // return;

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
                console.log(resultRaw);
                var parsedData = parseResult(resultRaw);
                console.log(parsedData);
                ipcRenderer.send('show-result', parsedData);
            });
        });
    }
}

// Input: result returned from AWS Transcribe.{JobName, accountId, results={transcripts=[{transcript}], items=[start_time, end_time, alternatives=[{confidence, content}], type]}, status}
// Output: parsed result. [{start, end, transcript}]
function parseResult(result) {
    let resultObj = JSON.parse(result).results;
    let transcript = resultObj.transcripts[0].transcript;
    let items = resultObj.items;
    var parsedResult = [];
    // Iterate through items, construct each sentence rather than split the 'transcript'
    let sentence = '';
    let start_time = null;
    let end_time = null;
    for (let item in items) {
        item = items[item];
        // if this word/item is the 1st word in current sentence, remember the start_time
        if (sentence == '') {
            start_time = item.start_time;
        }
        if (item.type == 'pronunciation') {
            sentence += ' ' + item.alternatives[0].content;
            end_time = item.end_time;
        } else if (item.type == 'punctuation') {
            if (item.alternatives[0].content == ',') {
                sentence += item.alternatives[0].content;
            } else if (endPunctuations.includes(item.alternatives[0].content)) {
                // remember end_time
                sentence += item.alternatives[0].content;
                // add sentence to parsed results
                sentence = sentence.trim();
                parsedResult.push({start: start_time, end: end_time, transcript: sentence});
                // reset sentence
                sentence = '';
                start_time = null;
                end_time = null;
            }
        }
    }   // end for
    if (sentence != '') {
        sentence = sentence.trim();
        parsedResult.push({start: start_time, end: end_time, transcript: sentence});
    }
    return parsedResult;
}

module.exports = {
    init: init,
    doRecognize: doRecognize
};