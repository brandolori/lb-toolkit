"use strict"

const { app, BrowserWindow, Tray, ipcMain, nativeTheme, clipboard, globalShortcut } = require('electron');
// Module to create native browser window.

const ChildProcess = require("child_process")
const path = require('path');
const { join, resolve } = require('path');
const robot = require("robotjs");
const fs = require('fs');
const fp = require('fs').promises


const dirSize = (directory) => {
    const files = fs.readdirSync(directory);

    return files.reduce((accumulator, file) => {
        const stats = fs.statSync(path.join(directory, file))
        return stats.isFile()
            ? accumulator + stats.size
            : accumulator + dirSize(path.join(directory, file));
    }, 0);
}

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;
let next;
let prev;
let playPause;

const publicFolder = app.isPackaged
    ? "../build"
    : "../public"

const handleCommand = (command, args) => new Promise((res, rej) => {
    const proc = ChildProcess.spawn(command, args)

    let buffer = []
    proc.stdout.on("data", (data) => {

        buffer.push(data)
    })

    proc.on("close", () => {
        const finalStdout = buffer.join("")
        res(finalStdout)
    })

})

function createWindow() {

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

    globalShortcut.register('Super+Shift+C', () => {
        const { x, y } = robot.getMousePos()
        clipboard.writeText(robot.getPixelColor(x, y))
    })

    ipcMain.handle('cmd:fetchUpdates', async () => {

        const stdout = await handleCommand("winget", ["upgrade"])
        return stdout.substring(stdout.indexOf("Nome"))

    })

    ipcMain.handle('cmd:updatePackage', async (ev, packageName) => {
        console.log("updating", packageName)
        const stdout = await handleCommand("winget", ["upgrade", packageName])
        console.log("updated", packageName)
        return stdout

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
        return process.env[variable];
    })

    ipcMain.handle('fs:deleteFolder', async (ev, folderPath) => {
        const content = await fp.readdir(folderPath)
        const promises = content.map(async file => {
            await fp.rm(path.join(folderPath, file), { recursive: true })
        })
        await Promise.all(promises)
    })


    // Create the browser window.
    mainWindow = new BrowserWindow({
        width: 800, height: 600,
        webPreferences: {
            preload: join(__dirname, 'preload.js'),
            devTools: !app.isPackaged,
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
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => createWindow());

// Quit when all windows are closed.
app.on('window-all-closed', function () {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
        app.quit()
    }
});

app.on('activate', function () {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (mainWindow === null) {
        createWindow()
    }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.