"use strict"
const { contextBridge, ipcRenderer } = require('electron')

// https://www.electronjs.org/docs/latest/tutorial/process-model
// https://www.electronjs.org/docs/latest/tutorial/sandbox
// while sandboxing, we only have access to limited apis,
// and no general-purpose require()

// require("./test")

contextBridge.exposeInMainWorld('electronAPI', {
    fetchUpdates: () => ipcRenderer.invoke('cmd:fetchUpdates'),
    updatePackage: (packageName) => ipcRenderer.invoke('cmd:updatePackage', packageName),

    calculateFolderSize: (path) => ipcRenderer.invoke("fs:calculateFolderSize", path),
    getEnvironmentVariable: (variable) => ipcRenderer.invoke("fs:getEnvironmentVariable", variable),
    appGetPath: (name) => ipcRenderer.invoke("fs:appGetPath", name),
    deleteFolder: (path) => ipcRenderer.invoke("fs:deleteFolder", path),
    openFolder: (path) => ipcRenderer.send("fs:openFolder", path),

    getSettingValue: (setting) => ipcRenderer.invoke("settings:getSettingValue", setting),
    setSettingValue: (setting, value) => ipcRenderer.invoke("settings:setSettingValue", setting, value),

    readyToShow: () => ipcRenderer.send('render:readyToShow'),

    retrieveConnectionDetails: () => ipcRenderer.invoke('wifi:retrieveConnectionDetails'),

    handleClipboardChange: (callback) => {
        ipcRenderer.removeAllListeners("clipboard:change")
        ipcRenderer.on('clipboard:change', callback)
    },
    clipboardPaste: (text) => ipcRenderer.send("clipboard:paste", text),
    fetchClips: (filter) => ipcRenderer.invoke('clipboard:fetchClips', filter),
})