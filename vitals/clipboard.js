const { AzureSASCredential, TableClient } = require("@azure/data-tables");
const { getSettingValue } = require("./settings");
const clipboardListener = require('clipboard-event');
const SettingsItems = require("../src/SettingsItems");

const getTableClient = () => {
    const account = getSettingValue(SettingsItems.azureStorageAccount)
    const SASToken = getSettingValue(SettingsItems.azureSASToken)
    const tableName = getSettingValue(SettingsItems.azureTableName)
    return new TableClient(
        `https://${account}.table.core.windows.net`,
        tableName,
        new AzureSASCredential(SASToken)
    );

}

const startClipboardListener = (callback) => {
    clipboardListener.on('change', callback)
    clipboardListener.startListening()
}

const stopClipboardListener = () => {
    clipboardListener.removeAllListeners()
    clipboardListener.stopListening()
}

module.exports = { getTableClient, startClipboardListener, stopClipboardListener }