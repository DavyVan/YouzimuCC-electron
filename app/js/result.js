'use strict';

const {ipcRenderer, remote} = require('electron');
const util = require('./js/utils');
const fs = require('fs');

var tbodyEl = document.querySelector('#resultsTbody');
tbodyEl.innerHTML = '';
var exportBtnEl = document.querySelector('#export');
var exportSpinnerEl = document.querySelector('#export-spinner');
var exportBtnTextEl = document.querySelector('#export-button-text');
var filename = '';
var _result = null;

ipcRenderer.on('result', (event, result)=>{
    _result = result;
    // show result
    for (let i = 0; i < result.length; i++) {
        let raw = `
<tr>
<th scope="row">${i}</th>
<td>${util.seconds2str(result[i].start)}</td>
<td>${util.seconds2str(result[i].end)}</td>
<td class="text-justify">${result[i].transcript}</td>
</tr>`;
        // tbodyEl.append(raw);
        tbodyEl.innerHTML += raw;
    }
});

exportBtnEl.addEventListener('click', ()=>{
    filename = remote.dialog.showSaveDialog(remote.getCurrentWindow(),
    {
        title: '存储为srt',
        buttonLabel: '选择',
        filters: [{name: '仅支持存储为srt', extensions: ['srt']}]
    });
    if (filename !== undefined) {
        console.log('导出：' + filename);

        // Update UI
        exportBtnTextEl.setAttribute('hidden', true);
        exportSpinnerEl.removeAttribute('hidden');
        // May show notification message here

        // Construct srt file content
        // For each entry in srt file:
        // 1
        // 00:00:00,980 --> 00:00:04,130
        // <content>
        // \n
        let fileContent = '';
        for (let i = 0; i < _result.length; i++) {
            fileContent += 
`${i+1}
${util.seconds2str(_result[i].start)} --> ${util.seconds2str(_result[i].end)}
${_result[i].transcript}

`;
        }
        
        // Write to file
        fs.writeFileSync(filename, fileContent);

        // recover UI
        exportSpinnerEl.setAttribute('hidden', true);
        exportBtnTextEl.removeAttribute('hidden');
    }
});