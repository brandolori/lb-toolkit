const { Tray, Menu, app } = require("electron")
const { join } = require("path")
const robot = require("robotjs")


/** @type Tray */
let next

/** @type Tray */
let prev

/** @type Tray */
let playPause

/** @type Tray */
let mainIcon


const createMediaTrays = () => {
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

const destroyMediaTrays = () => {
    next.destroy()
    prev.destroy()
    playPause.destroy()
}

const createMainTray = (showCallback, quitCallback) => {


    mainIcon = new Tray(join(__dirname, "../assets/favicon.ico"))
    mainIcon.addListener("click", () => {
        showCallback()
    })

    mainIcon.setContextMenu(Menu.buildFromTemplate([
        {
            label: 'Show',
            click: () => {
                showCallback()
            }
        },
        {
            label: 'Quit',
            click: () => {
                quitCallback() // actually quit the app.
            }
        },
    ]))
}

module.exports = { createMediaTrays, destroyMediaTrays, createMainTray }