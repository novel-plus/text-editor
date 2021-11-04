const { contextBridge, ipcRenderer } = require('electron');
const marked = require('marked');
const path = require('path');

function dispatchMainEvent(eventName, payload) {
    const mainEventReceiver = document.getElementById('main-event-receiver');
    const openedEvent = new CustomEvent(eventName, {
        detail: payload,
    })
    mainEventReceiver.dispatchEvent(openedEvent);
}

contextBridge.exposeInMainWorld('pathApi', {
    basename: path.basename
})

contextBridge.exposeInMainWorld('darkModeApi', {
    toggle: () => ipcRenderer.invoke('dark-mode:toggle'),
    system: () => ipcRenderer.invoke('dark-mode:system')
})

contextBridge.exposeInMainWorld('fileControlApi', {
    new: () => ipcRenderer.invoke('file-control:new'),
    open: () => ipcRenderer.invoke('file-control:open'),
    save: (filename, content) => ipcRenderer.invoke('file-control:save', filename, content)
})

contextBridge.exposeInMainWorld('markdownApi', {
    parse: (raw) => marked.parse(raw)
})

// receiver
ipcRenderer.on('file-render:opened', (event, result) => {
    dispatchMainEvent('file-render:opened', result);
})

ipcRenderer.on('file-render:save-request', () => {
    dispatchMainEvent('file-render:save-request');
})
