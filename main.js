const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');

function createMainWindow() {
    const mainWindow = new BrowserWindow({
        width: 600,
        height: 800,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: true
        },
        show: false
    })
    mainWindow.loadFile('editor/index.html');
    return mainWindow;
}

async function loadTextFile(targetWindow) {
    const file = await dialog.showOpenDialog(targetWindow, {
        properties: ['openFile'],
        filters: [
            { name: '마크다운 파일', extensions: ['md', 'markdown'] },
            { name: '텍스트 파일', extensions: ['txt'] },
            { name: '모든 파일', extensions: ['*'] }
        ]
    });
    const result = {
        canceled: true,
        path: '',
        content: ''
    }
    const canceled = file.canceled;
    const path = file.filePaths[0];
    if (canceled || !path)
        return result;
    const content = fs.readFileSync(path).toString();

    result.canceled = canceled;
    result.path = path;
    result.content = content;
    return result;
}

function initializeWindows() {
    const mainWindow = createMainWindow();
    
    ipcMain.handle('fileControl:open', (event) => {
        return loadTextFile(mainWindow);
    })
    mainWindow.once('ready-to-show', () => {
        mainWindow.show();
    })
}


// main loop
app.whenReady().then(() => {
    initializeWindows();
    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            initializeWindows();
        }
    })
})

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
})