'use strict';

const IBM_Credentials = require('./ibm-credentials');
const IBM_Config = require('./ibm-config');
const fs = require('fs');
const http = require('https');
const {remote, ipcRenderer} = require('electron');
const nconf = require('nconf').file({file: app.getAppPath() + '/config.json'});
var language = null;
var language_model = null;

function init() {
    // get language from config
    nconf.load();
    language = nconf.get('language');
    IBM_Config.language_available.forEach((item)=>{
        if (item.name == language) {
            language_model = item.model;
        }
    });
}

function doRecognize(filename) {
    // debug
    // let result = require('./sampledata').trim();
    // result = parseResult(result);
    // ipcRenderer.send('show-result', result);
    // return;
    /***
     * Native HTTP
     * IBM SDK is not working well :(
     */
    let options = {
        host: 'gateway-tok.watsonplatform.net',
        method: 'POST',
        path: '/speech-to-text/api/v1/recognize?timestamps=true&smart_formatting=true&model=' + language_model,
        // headers: {
        //     'Content-Type': 'audio/mp3'
        // },
        auth: 'apikey:' + IBM_Credentials.iam_apikey,
    };

    let data = '';
    let req = http.request(options, (res)=>{
        console.log(`状态码: ${res.statusCode}`);
        // console.log(`响应头: ${JSON.stringify(res.headers)}`);
        // console.log(res);
        res.on('data', (chunk)=>{   // Receiving data
            ipcRenderer.send('request-receiving');
            console.log('Data chunk received.');
            data += chunk;
        });
        res.on('end', ()=>{         // All data received
            if (req.aborted) return;
            ipcRenderer.send('request-received');
            console.log('Response end.');
            console.log(data);
            var parsedData = parseResult(data.trim());
            ipcRenderer.send('show-result', parsedData);
        });
    });

    req.on('error', (e)=>{
        console.log('error', e);
        ipcRenderer.send('request-error', e.message);
    });

    // Read file and upload
    let buffer = fs.readFileSync(filename);
    req.write(buffer);
    req.end(()=>{
        console.log('request end callback');
        ipcRenderer.send('request-sent');
    });

    ipcRenderer.on('request-abort', ()=>{
        req.abort();
        console.log('Request aborted.');
    });
}

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