const path = require('path');
const { join } = require('path');
const robot = require("robotjs");
const fp = require('fs').promises
const { getSettingValue, settingsChangeEmitter, SettingsItem, setSettingValue } = require("./settings");
const { Tray, globalShortcut, clipboard, BrowserWindow, app, Menu, ipcMain, nativeTheme } = require("electron");
const { dirSize, handleCommand } = require('./utils');
const getWifiSSID = require('./getWifiSSID');
const getWifiPassword = require('./getWifiPassword');
const clipboardListener = require('clipboard-event');
const { v4: uuidv4 } = require('uuid');
const tableClient = require("./clipboard")

let ignoreSingleCopy = false

clipboardListener.startListening();

clipboardListener.on('change', async () => {
    if (clipboard.availableFormats().includes("text/plain")) {
        if (ignoreSingleCopy) {
            ignoreSingleCopy = false
            return
        }

        const text = clipboard.readText()

        if (text.replace("\r", "").replace(" ", "").replace("\n", "").length > 0) {
            await tableClient.createEntity({
                partitionKey: "pc",
                rowKey: uuidv4(),
                text: clipboard.readText()
            })
            mainWindow?.webContents.send('clipboard:change', 1)
        }
    }
});


// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
/** @type BrowserWindow */
let mainWindow

/** @type Tray */
let next

/** @type Tray */
let prev

/** @type Tray */
let playPause

/** @type Tray */
let mainIcon

const createTrays = () => {
    next = new Tray(join(__dirname, "../assets/next.ico"))
    next.addListener("click", () => {
        robot.keyTap("audio_next")
    })

    prev = new Tray(join(__dirname, "../assets/back.ico"))
    prev.addListener("click", () => {
        robot.keyTap("audio_prev")
    })

    playPause = new Tray(join(__dirname, "../assets/play.ico"))
    playPause.addListener("click", () => {
        robot.keyTap("audio_play")
    })
}

const destroyTrays = () => {
    next.destroy()
    prev.destroy()
    playPause.destroy()
}

const keyCombo = 'super+control+x'

const registerColorPicker = () => {
    globalShortcut.register(keyCombo, () => {
        const { x, y } = robot.getMousePos()
        clipboard.writeText(robot.getPixelColor(x, y))
    })
}

const unregisterColorPicker = () => {
    globalShortcut.unregister(keyCombo)
}

const createWindow = () => {
    // Create the browser window.
    mainWindow = new BrowserWindow({
        show: false,
        width: 800,
        height: 600,
        minHeight: 400,
        minWidth: 600,
        backgroundColor: nativeTheme.shouldUseDarkColors ? "#1a1b1e" : undefined,
        titleBarStyle: "hidden",
        titleBarOverlay: {
            color: nativeTheme.shouldUseDarkColors ? "#1a1b1e" : undefined,
            symbolColor: nativeTheme.shouldUseDarkColors ? "white" : undefined,
            height: 40
        },
        webPreferences: {
            preload: join(__dirname, 'preload.js'),
            devTools: !app.isPackaged,
            webSecurity: false
        }
    });

    mainWindow.removeMenu()

    // and load the index.html of the app.
    mainWindow.loadURL(app.isPackaged
        ? `file://${join(__dirname, '../build/index.html')}`
        : 'http://localhost:3000');

    // Open the DevTools.
    if (!app.isPackaged)
        mainWindow.webContents.openDevTools();

    // Emitted when the window is closed.
    mainWindow.on('closed', function () {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        mainWindow = null
    })

    ipcMain.on("render:readyToShow", () => {
        mainWindow.show()
    })

    ipcMain.on("clipboard:paste", (ev, text) => {
        ignoreSingleCopy = true
        clipboard.writeText(text)
    })
}

const showOrRecreateMainWindow = () => {
    if (mainWindow) {
        mainWindow.focus()
    } else {
        createWindow()
    }
}

const onReady = () => {

    mainIcon = new Tray(join(__dirname, "../assets/favicon.ico"))
    mainIcon.addListener("click", () => {
        showOrRecreateMainWindow()
    })
    app.on("second-instance", () => {
        showOrRecreateMainWindow()
    })

    mainIcon.setContextMenu(Menu.buildFromTemplate([
        {
            label: 'Show',
            click: () => {
                createWindow()
            }
        },
        {
            label: 'Quit',
            click: () => {
                app.quit() // actually quit the app.
            }
        },
    ]))

    // enable media tray icons, then register on setting change
    if (getSettingValue(SettingsItem.enableMediaControls))
        createTrays()

    settingsChangeEmitter.on(SettingsItem.enableMediaControls, (value) => {
        if (value)
            createTrays()
        else
            destroyTrays()
    })

    // enable color picker, then register on setting change
    if (getSettingValue(SettingsItem.enableColorPicker))
        registerColorPicker()

    settingsChangeEmitter.on(SettingsItem.enableColorPicker, (value) => {
        if (value)
            registerColorPicker()
        else
            unregisterColorPicker()
    })

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

    // if (!process.argv.includes(atLoginFlag))
    createWindow()
}

module.exports = onReady