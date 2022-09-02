"use strict"
const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
    fetchUpdates: () => ipcRenderer.invoke('cmd:fetchUpdates'),
    updatePackage: (packageName) => ipcRenderer.invoke('cmd:updatePackage', packageName),
    calculateFolderSize: (path) => ipcRenderer.invoke("fs:calculateFolderSize", path),
    getEnvironmentVariable: (variable) => ipcRenderer.invoke("fs:getEnvironmentVariable", variable),
    deleteFolder: (path) => ipcRenderer.invoke("fs:deleteFolder", path),
    getSettingValue: (setting) => ipcRenderer.invoke("settings:getSettingValue", setting),
    setSettingValue: (setting, value) => ipcRenderer.invoke("settings:setSettingValue", setting, value),
    readyToShow: () => ipcRenderer.send('render:readyToShow')
})