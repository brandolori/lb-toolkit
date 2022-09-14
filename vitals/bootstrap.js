const { join } = require('path');
const robot = require("robotjs");
const { getSettingValue, settingsChangeEmitter, SettingsItem } = require("./settings");
const { globalShortcut, clipboard, BrowserWindow, app, ipcMain, nativeTheme } = require("electron");
const clipboardListener = require('clipboard-event');
const { v4: uuidv4 } = require('uuid');
const tableClient = require("./clipboard");
const initMessageHandlers = require('./initMessageHandlers');
const { createMediaTrays, destroyMediaTrays, createMainTray } = require('./trays');

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
            mainWindow?.webContents.send('clipboard:change')
        }
    }
});

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.

/** @type BrowserWindow */
let mainWindow
/** @type BrowserWindow */
let clipboardWindow

let windowsByWebcontentsId = {}

const colorPickerKeyCombo = 'super+control+x'

const registerColorPicker = () => {
    globalShortcut.register(colorPickerKeyCombo, () => {
        const { x, y } = robot.getMousePos()
        clipboard.writeText(robot.getPixelColor(x, y))
    })
}

const unregisterColorPicker = () => {
    globalShortcut.unregister(colorPickerKeyCombo)
}

const createClipboardWindow = () => {
    clipboardWindow = new BrowserWindow({
        show: false,
        skipTaskbar: true,
        width: 400,
        height: 400,
        resizable: false,
        backgroundColor: nativeTheme.shouldUseDarkColors ? "#1a1b1e" : undefined,
        titleBarStyle: "hidden",
        webPreferences: {
            preload: join(__dirname, 'preload.js'),
            devTools: !app.isPackaged,
            webSecurity: false
        }
    });

    windowsByWebcontentsId[clipboardWindow.webContents.id] = clipboardWindow

    clipboardWindow.removeMenu()

    const baseUrl = app.isPackaged
        ? `file://${join(__dirname, '../build/index.html')}`
        : 'http://localhost:3000'
    clipboardWindow.loadURL(`${baseUrl}?page=clipboard`);

    clipboardWindow.on("blur", () => {
        clipboardWindow.close()
    })

    clipboardWindow.on('close', () => {
        delete windowsByWebcontentsId[clipboardWindow.webContents.id]
        clipboardWindow = null
    })

}

const showOrCreateMainWindow = () => {
    if (mainWindow) {
        mainWindow.focus()
    } else {
        createMainWindow()
    }
}

const createMainWindow = () => {
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
    })

    windowsByWebcontentsId[mainWindow.webContents.id] = mainWindow

    mainWindow.removeMenu()

    // and load the index.html of the app.
    mainWindow.loadURL(app.isPackaged
        ? `file://${join(__dirname, '../build/index.html')}`
        : 'http://localhost:3000');

    // Open the DevTools.
    if (!app.isPackaged)
        mainWindow.webContents.openDevTools();

    mainWindow.on('close', () => {
        delete windowsByWebcontentsId[mainWindow.webContents.id]
        mainWindow = null
    })
}

const onReady = () => {

    createMainTray(() => showOrCreateMainWindow(), () => app.quit())

    app.on("second-instance", () => {
        showOrCreateMainWindow()
    })

    // enable media tray icons, then register on setting change
    if (getSettingValue(SettingsItem.enableMediaControls))
        createMediaTrays()

    settingsChangeEmitter.on(SettingsItem.enableMediaControls, (value) => {
        if (value)
            createMediaTrays()
        else
            destroyMediaTrays()
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

    globalShortcut.register("super+control+b", () => {
        if (!clipboardWindow) {
            createClipboardWindow()
        }
    })

    initMessageHandlers()

    ipcMain.on("clipboard:paste", (ev, text) => {
        ignoreSingleCopy = true
        clipboard.writeText(text)
    })

    ipcMain.on("render:readyToShow", (ev) => {
        const window = windowsByWebcontentsId[ev.sender.id]
        window.show()
    })

    // if (!process.argv.includes(atLoginFlag))
    createMainWindow()
}

module.exports = onReady