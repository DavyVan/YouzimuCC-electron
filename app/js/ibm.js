'use strict';

const IBM_Credentials = require('./ibm-credentials');
const fs = require('fs');
const http = require('https');
const {remote, ipcRenderer} = require('electron');

function doRecognize(filename) {
    // return;
    /***
     * Native HTTP
     * IBM SDK is not working well :(
     */
    let options = {
        host: 'gateway-tok.watsonplatform.net',
        method: 'POST',
        path: '/speech-to-text/api/v1/recognize?timestamps=true&smart_formatting=true',
        headers: {
            'Content-Type': 'audio/mp3'
        },
        auth: 'apikey:' + IBM_Credentials.iam_apikey,
    };

    let data = '';
    let req = http.request(options, (res)=>{
        console.log(`状态码: ${res.statusCode}`);
        // console.log(`响应头: ${JSON.stringify(res.headers)}`);
        // console.log(res);
        res.on('data', (chunk)=>{
            ipcRenderer.send('request-receiving');
            console.log('Data chunk received.');
            data += chunk;
        });
        res.on('end', ()=>{
            ipcRenderer.send('request-received');
            console.log('Response end.');
            console.log(data);
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
}

module.exports = {
    doRecognize: doRecognize
};