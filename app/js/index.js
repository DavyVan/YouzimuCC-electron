'use strict';

const {ipcRenderer, remote} = require('electron');
const {dialog} = remote;
const requester = require('./js/ibm');

var submitButtonEl = document.querySelector('#submit');
var chooseFileButtonEl = document.querySelector('#choose-file');
var filenameTextEl = document.querySelector('#filename');
var submitSpinnerEl = document.querySelector('#submit-spinner');
var submitButtonTextEl = document.querySelector('#submit-button-text');
var settingsButtonEl = document.querySelector('#settings-btn');
var filename = '';

// Disable submit button when start up
submitButtonEl.setAttribute('disabled', 'true');

// Choose file button
chooseFileButtonEl.addEventListener('click', ()=>{
    filename = dialog.showOpenDialog(remote.getCurrentWindow(), {
        title: '选择需要识别的音频文件',
        buttonLabel: '选择',
        filters: [{name: '支持的音频', extensions: ['mp3'/*, 'flac', 'ogg', 'wav', 'webm'*/]}],
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

    // Disable the button and show spinner
    submitButtonEl.setAttribute('disabled', true);
    chooseFileButtonEl.setAttribute('disabled', true);
    submitSpinnerEl.removeAttribute('hidden');
    submitButtonTextEl.setAttribute('hidden', true);

    // Tell main process to show the progress window
    ipcRenderer.send('request-start');

    requester.doRecognize(filename[0]);
});

ipcRenderer.on('result-closed', ()=>{
    submitButtonEl.removeAttribute('disabled');
    chooseFileButtonEl.removeAttribute('disabled');
    submitSpinnerEl.setAttribute('hidden', true);
    submitButtonTextEl.removeAttribute('hidden');
});

settingsButtonEl.addEventListener('click', ()=>{
    ipcRenderer.send('open-settings');
});