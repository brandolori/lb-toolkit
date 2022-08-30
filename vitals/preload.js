"use strict"
const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
    fetchUpdates: () => ipcRenderer.invoke('cmd:fetchUpdates'),
    updatePackage: (packageName) => ipcRenderer.invoke('cmd:updatePackage', packageName),
    calculateFolderSize: (path) => ipcRenderer.invoke("fs:calculateFolderSize", path),
    getEnvironmentVariable: (variable) => ipcRenderer.invoke("fs:getEnvironmentVariable", variable),
    deleteFolder: (path) => ipcRenderer.invoke("fs:deleteFolder", path),
})