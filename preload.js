const { contextBridge, ipcRenderer } = require('electron');
const marked = require('marked');

contextBridge.exposeInMainWorld('darkMode', {
    toggle: () => ipcRenderer.invoke('dark-mode:toggle'),
    system: () => ipcRenderer.invoke('dark-mode:system')
})

contextBridge.exposeInMainWorld('fileControl', {
    new: () => ipcRenderer.invoke('fileControl:new'),
    open: () => ipcRenderer.invoke('fileControl:open'),
    save: () => ipcRenderer.invoke('fileContorl:save')
})

contextBridge.exposeInMainWorld('markdown', {
    render: (markdown) => marked.parse(markdown)
})
