const { join } = require('path');
const robot = require("robotjs");
const { getSettingValue, settingsChangeEmitter } = require("./settings");
const { globalShortcut, clipboard, BrowserWindow, app, ipcMain, nativeTheme, screen } = require("electron");
const { getTableClient, startClipboardListener, stopClipboardListener } = require("./clipboard");
const { isLogin, registerAtLogin, unregisterAtLogin } = require("./login");
const initMessageHandlers = require('./initMessageHandlers');
const { createMediaTrays, destroyMediaTrays, createMainTray } = require('./trays');
const SettingsItems = require('../src/SettingsItems');

let ignoreSingleCopy = false

const startListeningToClipboard = () => {

    const tableClient = getTableClient()

    startClipboardListener(async () => {
        if (clipboard.availableFormats().includes("text/plain")) {
            if (ignoreSingleCopy) {
                ignoreSingleCopy = false
                return
            }

            const text = clipboard.readText()

            if (text.replace("\r", "").replace(" ", "").replace("\n", "").length > 0) {
                await tableClient.createEntity({
                    partitionKey: "pc",
                    rowKey: Date.now().toString(),
                    text: clipboard.readText()
                })
                mainWindow?.webContents.send('clipboard:change')
            }
        }
    });

}

const stopListeningToClibpoard = () => {
    stopClipboardListener()
}

// enable clipboard listener, then register to settings change
if (getSettingValue(SettingsItems.enableClipboardSync))
    startListeningToClipboard()

settingsChangeEmitter.on(SettingsItems.enableClipboardSync, (value) => {
    if (value)
        startListeningToClipboard()
    else
        stopListeningToClibpoard()
})



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
        try {
            const { x, y } = robot.getMousePos()
            clipboard.writeText(robot.getPixelColor(x, y))
        } catch (e) { }
    })
}

const unregisterColorPicker = () => {
    globalShortcut.unregister(colorPickerKeyCombo)
}

const createClipboardWindow = () => {

    const cursorPoint = screen.getCursorScreenPoint()

    clipboardWindow = new BrowserWindow({
        show: false,
        skipTaskbar: true,
        width: 400,
        height: 400,
        resizable: false,
        backgroundColor: nativeTheme.shouldUseDarkColors ? "#1a1b1e" : undefined,
        titleBarStyle: "hidden",
        x: cursorPoint.x,
        y: cursorPoint.y,
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
            webSecurity: false,
            sandbox: true,
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

    if (app.isPackaged) {
        settingsChangeEmitter.on(SettingsItems.enableRunOnLogin, (value) => {
            if (value)
                registerAtLogin()
            else
                unregisterAtLogin()
        })
    }

    createMainTray(() => showOrCreateMainWindow(), () => app.quit())

    app.on("second-instance", () => {
        showOrCreateMainWindow()
    })

    // enable media tray icons, then register on setting change
    if (getSettingValue(SettingsItems.enableMediaControls))
        createMediaTrays()

    settingsChangeEmitter.on(SettingsItems.enableMediaControls, (value) => {
        if (value)
            createMediaTrays()
        else
            destroyMediaTrays()
    })

    // enable color picker, then register on setting change
    if (getSettingValue(SettingsItems.enableColorPicker))
        registerColorPicker()

    settingsChangeEmitter.on(SettingsItems.enableColorPicker, (value) => {
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

    // make sure window are shown when React has rendered
    // how it works: every window has a webcontents id,
    // the same webcontents id is in every event emitted by the window
    // so we show the window by finding it in a dictionary
    ipcMain.on("render:readyToShow", (ev) => {
        const window = windowsByWebcontentsId[ev.sender.id]
        window.show()
    })

    if (!isLogin())
        createMainWindow()

}

module.exports = onReady