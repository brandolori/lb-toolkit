const { app } = require('electron');
const fs = require('fs');
const path = require("path");
const { EventEmitter } = require('stream');

const SettingsItem = {
    enableColorPicker: "enableColorPicker",
    enableMediaControls: "enableMediaControls",
    enableRunOnStartup: "enableRunOnStartup"
}

const DefaultValues = {
    [SettingsItem.enableColorPicker]: true,
    [SettingsItem.enableMediaControls]: true,
    [SettingsItem.enableRunOnStartup]: true,
}

const settingsFileName = "settings.json"

const settingsFilePath = path.join(app.getPath("userData"), settingsFileName)

const file = fs.readFileSync(settingsFilePath, { flag: "a+" })
let data

try {
    data = JSON.parse(file.toString())
} catch (e) {
    data = { ...DefaultValues }
    fs.writeFileSync(settingsFilePath, JSON.stringify(data))
}

const settingsChangeEmitter = new EventEmitter()

const getSettingValue = (setting) => data[setting]

const setSettingValue = (setting, value) => {
    data[setting] = value
    fs.writeFileSync(settingsFilePath, JSON.stringify(data))
    settingsChangeEmitter.emit(setting, value)
}

// emit the current values on startup
Object.keys(data).forEach(el => settingsChangeEmitter.emit(el, data[el]))


module.exports = { getSettingValue, setSettingValue, settingsChangeEmitter, SettingsItem }
