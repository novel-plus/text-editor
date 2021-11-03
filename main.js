const { app, BrowserWindow, ipcMain, dialog, Menu, MenuItem } = require('electron');
const path = require('path');
const fs = require('fs');

function createMainWindow() {
    const mainWindow = new BrowserWindow({
        webPreferences: {
            preload: path.join(__dirname, 'preload.js')
        },
        show: false
    })
    mainWindow.maximize();
    const menu = createMenu()
    Menu.setApplicationMenu(menu);
    mainWindow.loadFile('editor/index.html');
    return mainWindow;
}

function createWindow() {
    const focusedWindow = BrowserWindow.getFocusedWindow();
    const newWindow = new BrowserWindow({
        x: focusedWindow.x + 10,
        y: focusedWindow.y + 10,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js')
        },
        show: false
    });
    newWindow.loadFile('editor/index.html');
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
            click: () => loadTextFile(BrowserWindow.getFocusedWindow())
        }]
    }))
    return menu;
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

function initializeMain() {
    const mainWindow = createMainWindow();
    
    ipcMain.handle('fileControl:open', (event) => {
        return loadTextFile(mainWindow);
    })
    ipcMain.handle('fileControl:new', (event) => {
        const newWindow = createWindow();
        return true;
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