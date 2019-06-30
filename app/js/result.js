'use strict';

const {ipcRenderer} = require('electron');
const util = require('./js/utils');

var tbodyEl = document.querySelector('#resultsTbody');
tbodyEl.innerHTML = '';

ipcRenderer.on('result', (event, result)=>{
    // show result
    for (let i = 0; i < result.length; i++) {
        let raw = `<tr>
            <th scope="row">${i}</th>
            <td>${util.seconds2str(result[i].start)}</td>
            <td>${util.seconds2str(result[i].end)}</td>
            <td class="text-justify">${result[i].transcript}</td>
        </tr>`;
        // tbodyEl.append(raw);
        tbodyEl.innerHTML += raw;
    }
});