'use strict';

const {ipcRenderer} = require('electron');

var textDivEl = document.querySelector('#text');

ipcRenderer.on('request-error', (event, msg)=>{
    console.log('request-error:'+msg);
    textDivEl.innerHTML = '请求发生错误：' + msg;
});

ipcRenderer.on('request-sent', ()=>{
    textDivEl.innerHTML = '云端处理中……';
});

ipcRenderer.on('request-receiving', ()=>{
    textDivEl.innerHTML = '正在接收结果……';
});

ipcRenderer.on('request-received', ()=>{
    textDivEl.innerHTML = '已收到识别结果，解析中……';
});