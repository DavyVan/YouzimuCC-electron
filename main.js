'use strict';

const { app, BrowserWindow, dialog, ipcMain, Menu, MenuItem } = require('electron');
var screen = null;

var mainWin = null;
var progressWin = null;
var resultWin = null;
var settingsWin = null;

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
    mainWin.setMenu(null);
    mainWin.loadURL('file://' + __dirname + '/app/index.html');
    // mainWin.webContents.openDevTools({ mode: "detach" });
    mainWin.on('focus', ()=>{
        if (progressWin !== null) {
            progressWin.focus();
        }
        if (resultWin !== null) {
            resultWin.focus();
        }
        if (settingsWin !== null) {
            settingsWin.focus();
        }
    });

    ipcMain.on('request-start', () => {
        // mainWin.setEnabled(false);
        mainWin.webContents.send('disable-window');
        

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
            // mainWin.setEnabled(true);
            mainWin.webContents.send('enable-window');
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
        // mainWin.setEnabled(false);
        mainWin.webContents.send('disable-window');

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

        resultWin.on('close', (event)=>{
            // event.preventDefault();
            let t = dialog.showMessageBox(resultWin, {
                type: 'warning',
                buttons: ['取消', '确认关闭'],
                defaultId: 0,
                title: '关闭确认',
                message: '确认要关闭吗',
                detail: '您不能再次显示结果，除非重新提交任务',
                cancelId: 0
            });
            if (t == 0) {
                event.preventDefault();
            }
        });

        resultWin.on('closed', ()=>{
            resultWin = null;
            mainWin.webContents.send('result-closed');
            // mainWin.setEnabled(true);
            mainWin.webContents.send('enable-window');
        });

        // close progress window
        // Put this after the creation of resultWin, we can decide the close of progressWin is a abortion or on request finish
        progressWin.close();
        progressWin = null;
    });

    ipcMain.on('open-settings', ()=>{
        // mainWin.setEnabled(false);
        mainWin.webContents.send('disable-window');
        settingsWin = new BrowserWindow({
            width: 700,
            height: 600,
            resizable: false,
            webPreferences: {
                nodeIntegration: true
            },
            parent: mainWin,
            modal: false,
            title: '设置'
        });
        settingsWin.setMenu(null);
        settingsWin.loadURL('file://' + __dirname + '/app/settings.html');
        // settingsWin.webContents.openDevTools({mode: 'detach'});

        settingsWin.on('closed', ()=>{
            settingsWin = null;
            // mainWin.setEnabled(true);
            mainWin.webContents.send('enable-window');
        });
    });

    ipcMain.on('setting-changed', (event, provider)=>{
        // forward directly to index window
        mainWin.webContents.send('setting-changed', provider);
    });

    ipcMain.on('close-setting-window', ()=>{
        settingsWin.close();
    });
});     // End app.on('ready')

