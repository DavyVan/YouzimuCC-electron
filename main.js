'use strict';

const {app, BrowserWindow, dialog, ipcMain} = require('electron');

app.on('ready', function () {
    var mainWin = new BrowserWindow({
        width: 800,
        height: 600,
        resizable: false,
        webPreferences: {
            nodeIntegration: true
        }
    });
    mainWin.setMenu(null);
    mainWin.loadURL('file://' + __dirname + '/app/index.html');
    mainWin.webContents.openDevTools({mode: "detach"});
});

