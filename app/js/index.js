'use strict';

const {ipcRenderer, remote} = require('electron');
const {dialog} = remote;

var submitButtonEl = document.querySelector('#submit');
var chooseFileButtonEl = document.querySelector('#choose-file');
var filenameTextEl = document.querySelector('#filename');
var filename = '';

// Disable submit button when start up
submitButtonEl.setAttribute('disabled', 'true');

// Choose file button
chooseFileButtonEl.addEventListener('click', ()=>{
    filename = dialog.showOpenDialog(remote.getCurrentWindow(), {
        title: '选择需要识别的音频文件',
        buttonLabel: '选择',
        filters: [{name: '支持的音频', extensions: ['flac', 'mp3', 'ogg', 'wav', 'webm']}],
        properties: ['openFile']
    });
    console.log(filename);
    if (filename !== undefined) {
        filenameTextEl.setAttribute('placeholder', filename[0]);
        submitButtonEl.removeAttribute('disabled');
    }
});

// submit button
submitButtonEl.addEventListener('click', ()=>{
    console.log('Submit with ' + filename[0]);
});