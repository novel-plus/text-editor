const { app, BrowserWindow, ipcMain, dialog, Menu, MenuItem, globalShortcut } = require('electron');
const path = require('path');
const { promises } = require('fs');

const indexHtmlPath = 'editor/index.html';
const preloadJsPath = 'editor/preload.js';

function createMainWindow() {
    const mainWindow = new BrowserWindow({
        width: 1000,
        height: 1000,
        webPreferences: {
            preload: path.join(__dirname, preloadJsPath)
        },
        show: false
    })
    const menu = createMenu()
    Menu.setApplicationMenu(menu);
    mainWindow.loadFile(indexHtmlPath);

    mainWindow.webContents.openDevTools();
    return mainWindow;
}

function createWindow() {
    const focusedWindow = BrowserWindow.getFocusedWindow();
    const newWindow = new BrowserWindow({
        x: focusedWindow.x + 10,
        y: focusedWindow.y + 10,
        webPreferences: {
            preload: path.join(__dirname, preloadJsPath)
        },
        show: false
    });
    newWindow.loadFile(indexHtmlPath);
    newWindow.once('ready-to-show', () => {
        newWindow.show();
    })
    return newWindow;
}

function createMenu() {
    const menu = new Menu();
    const isMac = process.platform === 'darwin';
    menu.append(new MenuItem({
        label: '파일',
        submenu: [{
            role: 'new file',
            label: '새 파일',
            accelerator: isMac ? 'Cmd+N' : 'Ctrl+N',
            click: () => createWindow()
        }, {
            role: 'load file',
            label: '불러오기',
            accelerator: isMac ? 'Cmd+O' : 'Ctrl+O',
            click: () => {
                const focusedWindow = BrowserWindow.getFocusedWindow();
                loadTextFile(focusedWindow)
                .then((result)=>focusedWindow.webContents.send('file-render:opened', result))
            }
        }, {
            role: 'save file',
            label: '저장',
            accelerator: isMac ? 'Cmd+S' : 'Ctrl+S',
            click: () => {
                const focusedWindow = BrowserWindow.getFocusedWindow();
                focusedWindow.webContents.send('file-render:save-request')
            }
        }]
    }))
    return menu;
}

async function asyncReadFile(file) {
    const result = {
        canceled: true,
        path: '',
        content: ''
    }
    const canceled = file.canceled;
    const path = file.filePaths[0];
    if (canceled || !path)
        return result;
    const content = await promises.readFile(path, {encoding: 'utf-8'});

    result.canceled = canceled;
    result.path = path;
    result.content = content;
    return result;
}

async function asyncWriteFile(file, content) {
    if (!!file.canceled) return;
    const filename = file.filePath;
    try {
        await promises.writeFile(filename, content, {encoding: 'utf-8'});
        return true;
    } catch (error) {
        return false;
    }
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
    const result = await asyncReadFile(file);
    return result;
}

async function saveTextFile(targetWindow, filename, content) {
    const file = await dialog.showSaveDialog(targetWindow, {
        defaultPath: filename,
        filters: [
            { name: '마크다운 파일', extensions: ['md', 'markdown'] },
            { name: '텍스트 파일', extensions: ['txt'] },
            { name: '모든 파일', extensions: ['*'] }
        ]
    });
    const result = await asyncWriteFile(file, content);
    return result;
}

function initializeMain() {
    const mainWindow = createMainWindow();
    
    ipcMain.handle('file-control:open', (event) => {
        return loadTextFile(mainWindow);
    })
    ipcMain.handle('file-control:new', (event) => {
        const newWindow = createWindow();
        return true;
    })
    ipcMain.handle('file-control:save', (event, filename, content) => {
        return saveTextFile(mainWindow, filename, content);
    })
    mainWindow.once('ready-to-show', () => {
        mainWindow.show();
    })
}


// main loop
app.whenReady().then(() => {
    initializeMain();
    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            initializeMain();
        }
    })
})

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
})