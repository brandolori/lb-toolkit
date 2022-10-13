"use strict"
const { ipcMain, app, shell } = require("electron")
const getWifiPassword = require("./getWifiPassword")
const getWifiSSID = require("./getWifiSSID")
const { getHypervisor, setHypervisor } = require("./hypervisor")
const { getSettingValue, setSettingValue } = require("./settings")
const { handleCommand } = require("./utils")
const sudo = require('sudo-prompt')
const { default: emptyTrash } = require('empty-trash')

module.exports = () => {
    ipcMain.handle('cmd:fetchUpdates', async () => {

        const stdout = await handleCommand("winget", ["upgrade", "--include-unknown"])
        return stdout.substring(stdout.indexOf("Nome"))

    })

    ipcMain.handle('cmd:updatePackage', async (ev, packageName) => {
        const stdout = await handleCommand("winget", ["upgrade", packageName])
        return stdout

    })

    ipcMain.handle('cmd:retrieveHypervisorState', async () => {
        return await getHypervisor()
    })

    ipcMain.handle('cmd:executeHypervisorCommand', async (ev, value) => {
        return await setHypervisor(value)
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
        console.log("point a")
        return new Promise((res, rej) => {
            console.log("point b")
            sudo.exec(`powershell -noprofile -command "(ls ${path} -r | measure -sum Length).Sum"`,
                {
                    name: "lbtoolkit"
                }, (error, stdout) => {
                    console.log("point c")
                    if (error)
                        rej(error.message)

                    const number = (Number.parseInt(stdout.toString()) / 1_000_000)
                    res(Number.isNaN(number) ? 0 : number)
                })
            console.log("point d")
        })
    })

    ipcMain.handle('fs:getEnvironmentVariable', async (ev, variable) => {
        return process.env[variable]
    })

    ipcMain.handle('fs:deleteFolder', async (ev, path) => {

        // special case for the recycle bin: it's not a real folder
        if (path == "shell:RecycleBinFolder") {
            return emptyTrash()
        }

        return new Promise((res, rej) => {

            sudo.exec(`powershell -noprofile -command "Get-ChildItem ${path} | Remove-Item –recurse -Force"`,
                {
                    name: "lbtoolkit"
                },
                (error) => {
                    if (error)
                        rej(error.message)
                    res()
                })
        })
    })

    ipcMain.on("fs:openFolder", (ev, path) => {
        shell.showItemInFolder(path)
    })

    ipcMain.handle('wifi:retrieveConnectionDetails', async () => {
        const ssid = await getWifiSSID()
        const password = await getWifiPassword(ssid)

        return { ssid, password }
    })


    ipcMain.handle('display:currentRefreshRate', async () => {
        const stdout = await handleCommand(`${__dirname}\\bin\\refreshtool\\refreshtool.exe`, ["current"])
        return stdout.replace("\r\n", "")
    })

    ipcMain.handle('display:listRefreshRates', async () => {
        const stdout = await handleCommand(`${__dirname}\\bin\\refreshtool\\refreshtool.exe`, ["list"])
        return stdout.split("\r\n").filter(el => el != "")
    })

    ipcMain.handle('display:setRefreshRate', async (ev, value) => {
        const stdout = await handleCommand(`${__dirname}\\bin\\refreshtool\\refreshtool.exe`, ["change", value])
    })


    ipcMain.handle('app:getVersion', async () => {
        return app.getVersion()
    })

}