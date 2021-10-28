const { app, BrowserWindow } = require('electron')
const path = require('path')

function createWindow() {
    const win = new BrowserWindow({
        width: 800,
        height: 600
    })
    win.loadFile('static/index.html')
}

// app on ready
app.whenReady.then(() => {
    createWindow()

    app.on('activate', function() {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow()
        }
    })
})

// app on close
app.on('window-all-closed', function() {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})
