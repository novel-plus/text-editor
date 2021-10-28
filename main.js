const { app, BrowserWindow } = require('electron');
const path = require('path');
const { dialog, remote } = require('electron');
const fs = require('fs');

function openFile() {
    dialog.showOpenDialog((fileNames) => {
        if (fileNames === undefined) {
            console.log("No file selected");
            return;
        }
    
        fs.readFile(filePath, 'utf-8', (err, data) => {
            if (err) {
                alert("An error occured reading the file: " + err.message);
                return;
            }
            
            console.log("the file content is : " + data);
        });
    })
}

function createWindow() {
    const win = new BrowserWindow({
        width: 800,
        height: 600
    });
    win.loadFile('static/index.html');
}

// app on ready
app.whenReady().then(() => {
    createWindow();
    openFile();
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
