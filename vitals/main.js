"use strict"

const { app } = require('electron');
const { isSquirrel } = require('./squirrel');
// Module to create native browser window.

let canLoad = true

// this package checks if we are in install mode and executes the install scripts
if (isSquirrel()) {
    canLoad = false
    app.quit()
}

// make sure we are the only instance running, otherwise quit
if (!app.requestSingleInstanceLock()) {
    canLoad = false
    app.quit()
}

if (canLoad) {
    const onReady = require('./bootstrap');
    app.whenReady().then(() => onReady());

    app.on('window-all-closed', (ev) => {
        // leaving this empty prevents the default action
    })
}
