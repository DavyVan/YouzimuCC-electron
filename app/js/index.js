'use strict';

const {ipcRenderer, remote} = require('electron');
const {dialog, app} = remote;
const path = require('path');
const nconf = require('nconf').file({file: app.getAppPath() + '/config.json'});
var requester = require('./js/' + nconf.get('provider'));
requester.init();

var submitButtonEl = document.querySelector('#submit');
var chooseFileButtonEl = document.querySelector('#choose-file');
var filenameTextEl = document.querySelector('#filename');
var submitSpinnerEl = document.querySelector('#submit-spinner');
var submitButtonTextEl = document.querySelector('#submit-button-text');
var settingsButtonEl = document.querySelector('#settings-btn');
var overlayDivEl = document.getElementById('overlay');
var filename = '';
const audiofmt = ['mp3'/*, 'flac', 'ogg', 'wav', 'webm'*/];

// Disable submit button when start up
submitButtonEl.setAttribute('disabled', 'true');

// Choose file button
chooseFileButtonEl.addEventListener('click', ()=>{
    filename = dialog.showOpenDialog(remote.getCurrentWindow(), {
        title: '选择需要识别的音频文件',
        buttonLabel: '选择',
        filters: [{name: '支持的音频', extensions: audiofmt}],
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

ipcRenderer.on('setting-changed', (event, provider)=>{
    requester = require('./js/' + provider);
    requester.init();
});

ipcRenderer.on('disable-window', ()=>{
    overlayDivEl.removeAttribute('hidden');
});

ipcRenderer.on('enable-window', ()=>{
    overlayDivEl.setAttribute('hidden', 'true');
});

// Drag and drop
var dragndropDivEl = document.getElementById('dragndrop');
var dragndropTextDivEl = document.getElementById('dragndrop-text');

dragndropDivEl.ondragover = () => {
    return false;
};

dragndropDivEl.ondragleave = () => {
    return false;
};

dragndropDivEl.ondragend = () => {
    return false;
};
dragndropDivEl.ondrop = (event)=>{
    event.preventDefault();

    let filepath = event.dataTransfer.files[0].path;
    let filenum = event.dataTransfer.files.length;

    // if drag multiple files
    if (filenum > 1) {
        dragndropTextDivEl.innerHTML = '您只能选择一个文件';
        dragndropTextDivEl.classList.add('animated', 'shake');
        dragndropTextDivEl.addEventListener('animationend', (event)=>{
            dragndropTextDivEl.classList.remove('animated', 'shake');
        });
        return;
    };

    // if the file format is not supported
    if (audiofmt.indexOf(path.extname(filepath).toLowerCase().substring(1)) == -1) {
        dragndropTextDivEl.innerHTML = '文件格式不支持，请选择' + audiofmt.toString();
        dragndropTextDivEl.classList.add('animated', 'shake');
        dragndropTextDivEl.addEventListener('animationend', (event)=>{
            dragndropTextDivEl.classList.remove('animated', 'shake');
        });
        return;
    };
    
    filenameTextEl.setAttribute('placeholder', filepath);
    submitButtonEl.removeAttribute('disabled');
};