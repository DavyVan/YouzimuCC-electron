'use strict';

const { app, BrowserWindow, dialog, ipcMain } = require('electron');
var screen = null;

var mainWin = null;
var progressWin = null;
var resultWin = null;

app.on('ready', function () {
    mainWin = new BrowserWindow({
        width: 800,
        height: 600,
        resizable: false,
        webPreferences: {
            nodeIntegration: true
        }
    });
    mainWin.setMenu(null);
    mainWin.loadURL('file://' + __dirname + '/app/index.html');
    // mainWin.webContents.openDevTools({ mode: "detach" });

    ipcMain.on('request-start', () => {
        progressWin = new BrowserWindow({
            width: 300,
            height: 150,
            resizable: false,
            webPreferences: {
                nodeIntegration: true
            },
            parent: mainWin,
            modal: true
        });
        progressWin.setMenu(null);
        progressWin.loadURL('file://' + __dirname + '/app/progress.html');
        // progressWin.webContents.openDevTools({mode: 'detach'});

        progressWin.on('closed', ()=>{
            mainWin.webContents.send('request-abort');
            mainWin.webContents.send('result-closed');
        });
    });

    ipcMain.on('request-error', (event, msg) => {
        if (!progressWin.isDestroyed()) {
            progressWin.webContents.send('request-error', msg);
        }
    });

    ipcMain.on('request-sent', () => {
        if (!progressWin.isDestroyed()) {
            progressWin.webContents.send('request-sent');
        }
    });

    ipcMain.on('request-receiving', () => {
        progressWin.webContents.send('request-receiving');
    });

    ipcMain.on('request-received', () => {
        if (!progressWin.isDestroyed()) {       // Close progressWin when receiving will trigger this bug
            progressWin.webContents.send('request-received');
        }
    });

    ipcMain.on('show-result', (event, parsedData) => {
        // close progress window
        progressWin.close();
        progressWin = null;

        // open result window
        screen = require('electron').screen;
        const { width, height } = screen.getPrimaryDisplay().workAreaSize;
        resultWin = new BrowserWindow({
            width: 1024,
            height: height,
            resizable: true,
            webPreferences: {
                nodeIntegration: true
            },
            parent: mainWin,
            modal: true
        });
        resultWin.setMenu(null);
        resultWin.loadURL('file://' + __dirname + '/app/result.html');

        resultWin.webContents.on('dom-ready', ()=>{
            resultWin.webContents.send('result', parsedData);
        });
        // resultWin.webContents.openDevTools({ mode: 'detach' });

        resultWin.on('closed', ()=>{
            mainWin.webContents.send('result-closed');
        });
    });
});

