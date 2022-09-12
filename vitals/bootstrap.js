const { join } = require('path');
const robot = require("robotjs");
const { getSettingValue, settingsChangeEmitter, SettingsItem } = require("./settings");
const { Tray, globalShortcut, clipboard, BrowserWindow, app, Menu, ipcMain, nativeTheme } = require("electron");
const clipboardListener = require('clipboard-event');
const { v4: uuidv4 } = require('uuid');
const tableClient = require("./clipboard");
const initMessageHandlers = require('./initMessageHandlers');

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

    clipboardWindow.removeMenu()

    const baseUrl = app.isPackaged
        ? `file://${join(__dirname, '../build/index.html')}`
        : 'http://localhost:3000'
    clipboardWindow.loadURL(`${baseUrl}?page=clipboard`);

    ipcMain.on("render:clipboardReadyToShow", () => {
        clipboardWindow.show()
    })

    clipboardWindow.on("blur", () => {
        clipboardWindow.close()
    })

}

const showOrCreateMainWindow = () => {
    if (mainWindow && !mainWindow.isDestroyed()) {
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

const onReady = () => {

    mainIcon = new Tray(join(__dirname, "../assets/favicon.ico"))
    mainIcon.addListener("click", () => {
        showOrCreateMainWindow()
    })
    app.on("second-instance", () => {
        showOrCreateMainWindow()
    })

    mainIcon.setContextMenu(Menu.buildFromTemplate([
        {
            label: 'Show',
            click: () => {
                createMainWindow()
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

    globalShortcut.register("super+control+b", () => {
        if (!clipboardWindow || clipboardWindow.isDestroyed()) {
            createClipboardWindow()
        }
    })

    settingsChangeEmitter.on(SettingsItem.enableColorPicker, (value) => {
        if (value)
            registerColorPicker()
        else
            unregisterColorPicker()
    })

    initMessageHandlers()

    // if (!process.argv.includes(atLoginFlag))
    createMainWindow()
}

module.exports = onReady