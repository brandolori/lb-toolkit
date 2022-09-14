const { ipcMain, app } = require("electron")
const path = require("path")
const getWifiPassword = require("./getWifiPassword")
const getWifiSSID = require("./getWifiSSID")
const { getSettingValue, setSettingValue } = require("./settings")
const { handleCommand, dirSize } = require("./utils")
const fp = require('fs').promises

module.exports = () => {

    ipcMain.handle('cmd:fetchUpdates', async () => {

        const stdout = await handleCommand("winget", ["upgrade", "--include-unknown"])
        return stdout.substring(stdout.indexOf("Nome"))

    })

    ipcMain.handle('cmd:updatePackage', async (ev, packageName) => {
        const stdout = await handleCommand("winget", ["upgrade", packageName])
        return stdout

    })

    ipcMain.handle('settings:getSettingValue', (ev, setting) => {
        return getSettingValue(setting)
    })

    ipcMain.handle('settings:setSettingValue', (ev, setting, value) => {
        return setSettingValue(setting, value)
    })

    ipcMain.handle('fs:appGetPath', async (ev, name) => {
        return app.getPath(name)
    })


    ipcMain.handle('fs:calculateFolderSize', async (ev, path) => {
        try {
            return dirSize(path) / 1_000_000
        } catch (e) {
            console.log(e)
            return 0
        }
    })

    ipcMain.handle('fs:getEnvironmentVariable', async (ev, variable) => {
        return process.env[variable]
    })


    ipcMain.handle('fs:deleteFolder', async (ev, folderPath) => {
        const content = await fp.readdir(folderPath)
        const promises = content.map(async file => {
            await fp.rm(path.join(folderPath, file), { recursive: true })
        })
        await Promise.all(promises)
    })

    ipcMain.handle('wifi:retrieveConnectionDetails', async () => {
        const ssid = await getWifiSSID()
        const password = await getWifiPassword(ssid)

        return { ssid, password }
    })
}