const { app, BrowserWindow, protocol } = require('electron');
const path = require('path');
const express = require('express');

// Stable Linux/Wayland compatibility flags
app.commandLine.appendSwitch('disable-features', 'WaylandWpColorManagerV1');
app.commandLine.appendSwitch('enable-gpu-rasterization');
app.commandLine.appendSwitch('enable-oop-rasterization');
app.commandLine.appendSwitch('accelerated-video-decode');
app.commandLine.appendSwitch('ignore-gpu-blocklist');

let mainWindow;
let isBooted = false;

// Spin up a localized media stream proxy
const serverApp = express();
const PORT = 3999;
serverApp.use('/stream', express.static(path.join(__dirname, 'dvid')));
serverApp.listen(PORT, () => {
    console.log(`🎬 Local video stream server running on http://localhost:${PORT}`);
});

function createBootWindow() {
    mainWindow = new BrowserWindow({
        width: 1280,
        height: 720,
        frame: true,
        show: false,
        backgroundColor: '#000000',
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            webSecurity: false
        }
    });

    mainWindow.loadFile('boot.html');

    mainWindow.once('ready-to-show', () => {
        mainWindow.show();
    });

    mainWindow.webContents.on('did-finish-load', () => {
        if (!isBooted) {
            isBooted = true;
            setTimeout(() => {
                mainWindow.loadFile('ui.html');
            }, 11000);
        }
    });
}

app.whenReady().then(createBootWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});
