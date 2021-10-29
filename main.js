const { app, BrowserWindow, ipcMain, nativeTheme, Menu, MenuItem, globalShortcut} = require('electron');
const path = require('path');


function createWindow() {
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js')
        }
    });
    win.loadFile('src/index.html');
}

function registerIpcApi() {
    ipcMain.handle('dark-mode:toggle', () => {
        if (nativeTheme.shouldUseDarkColors) {
            nativeTheme.themeSource = 'light';
        } else {
            nativeTheme.themeSource = 'dark';
        }
        return nativeTheme.shouldUseDarkColors;
    })
    ipcMain.handle('dark-mode:system', () => {
        nativeTheme.themeSource = 'system';
    })
}

function createMenu() {
    const menu = new Menu()
    menu.append(new MenuItem({
        label: 'Electron',
        submenu: [{
            role: 'help',
            accelerator: process.platform === 'darwin' ? 'Alt+Cmd+I' : 'Alt+Shift+I',
            click: () => {console.log('Electron rocks!')}
        }]
    }))
    return menu;
}

Menu.setApplicationMenu(createMenu())

// app on ready
app.whenReady().then(()=>{
    globalShortcut.register('Alt+CommandOrControl+I', () => {
        console.log('Electron loves global shortcuts!');
    })
}).then(() => {
    createWindow();
    registerIpcApi();
    app.on('activate', function() {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

// app on close
app.on('window-all-closed', function() {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});
