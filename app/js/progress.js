'use strict';

const {ipcRenderer} = require('electron');

var textDivEl = document.querySelector('#text');
var rxCounter = 0;
var procCounter = 0;

ipcRenderer.on('request-error', (event, msg)=>{
    console.log('request-error:'+msg);
    textDivEl.innerHTML = '请求发生错误：' + msg;
});

ipcRenderer.on('request-sent', ()=>{
    procCounter++;
    textDivEl.innerHTML = '云端处理中……' + procCounter;
});

ipcRenderer.on('request-receiving', ()=>{
    rxCounter++;
    textDivEl.innerHTML = '正在接收结果……' + rxCounter;
});

ipcRenderer.on('request-received', ()=>{
    textDivEl.innerHTML = '已收到识别结果，解析中……';
});