const { app } = require('electron');
const fs = require('fs');
const path = require("path");
const { EventEmitter } = require('stream');

const SettingsItem = {
    enableColorPicker: "enableColorPicker",
    enableMediaControls: "enableMediaControls",
    azureStorageAccount: "azureStorageAccount",
    azureSASToken: "azureSASToken",
    azureTableName: "azureTableName"
}

const DefaultValues = {
    [SettingsItem.enableColorPicker]: true,
    [SettingsItem.enableMediaControls]: true,
    [SettingsItem.azureStorageAccount]: "",
    [SettingsItem.azureSASToken]: "",
    [SettingsItem.azureTableName]: "",
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

module.exports = { getSettingValue, setSettingValue, settingsChangeEmitter, SettingsItem }
