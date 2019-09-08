'use strict';

const { app, BrowserWindow, dialog, ipcMain, Menu, MenuItem } = require('electron');
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
        },
        title: 'YouzimuCC'
    });
    // var menu = new Menu();
    // menu.append(new MenuItem({
    //     click: (menuItem, browserWindow, event)=>{
    //         // TODO: open setting window
    //     },
    //     label: '设置',
    //     sublabel: '111',
    //     id: 'settings'
    // }));
    mainWin.setMenu(null);
    mainWin.loadURL('file://' + __dirname + '/app/index.html');
    mainWin.webContents.openDevTools({ mode: "detach" });
    mainWin.on('focus', ()=>{
        if (progressWin !== null) {
            progressWin.focus();
        }
        if (resultWin !== null) {
            resultWin.focus();
        }
    });

    ipcMain.on('request-start', () => {
        progressWin = new BrowserWindow({
            width: 300,
            height: 150,
            resizable: false,
            webPreferences: {
                nodeIntegration: true
            },
            parent: mainWin,
            modal: false,
            title: '请求进度'
        });
        progressWin.setMenu(null);
        progressWin.loadURL('file://' + __dirname + '/app/progress.html');
        // progressWin.webContents.openDevTools({mode: 'detach'});

        progressWin.on('closed', ()=>{
            progressWin = null;
            if (resultWin === null) {
                mainWin.webContents.send('request-abort');
                mainWin.webContents.send('result-closed');      // reset index window
            }
        });
    });

    ipcMain.on('request-error', (event, msg) => {
        if (!(progressWin === null || progressWin.isDestroyed())) {
            progressWin.webContents.send('request-error', msg);
        }
    });

    ipcMain.on('request-sent', () => {
        if (!(progressWin === null || progressWin.isDestroyed())) {
            progressWin.webContents.send('request-sent');
        }
    });

    ipcMain.on('request-receiving', () => {
        progressWin.webContents.send('request-receiving');
    });

    ipcMain.on('request-received', () => {
        if (!(progressWin === null || progressWin.isDestroyed())) {       // Close progressWin when receiving will trigger this bug
            progressWin.webContents.send('request-received');
        }
    });

    ipcMain.on('show-result', (event, parsedData) => {
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
            modal: false,
            title: '结果'
        });
        resultWin.setMenu(null);
        resultWin.loadURL('file://' + __dirname + '/app/result.html');

        resultWin.webContents.on('dom-ready', ()=>{
            resultWin.webContents.send('result', parsedData);
        });
        // resultWin.webContents.openDevTools({ mode: 'detach' });

        resultWin.on('closed', ()=>{
            resultWin = null;
            mainWin.webContents.send('result-closed');
        });

        // close progress window
        // Put this after the creation of resultWin, we can decide the close of progressWin is a abortion or on request finish
        progressWin.close();
        progressWin = null;
    });
});

