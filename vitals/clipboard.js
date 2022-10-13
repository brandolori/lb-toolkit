"use strict"
const { AzureSASCredential, TableClient, odata } = require("@azure/data-tables")
const { getSettingValue } = require("./settings")
const clipboardListener = require('clipboard-event')
const SettingsItems = require("../src/SettingsItems")
const { ipcMain } = require("electron")

const getTableClient = () => {
    const account = getSettingValue(SettingsItems.azureStorageAccount)
    const SASToken = getSettingValue(SettingsItems.azureSASToken)
    const tableName = getSettingValue(SettingsItems.azureTableName)
    return new TableClient(
        `https://${account}.table.core.windows.net`,
        tableName,
        new AzureSASCredential(SASToken)
    )

}

const startClipboardListener = (callback) => {
    clipboardListener.on('change', callback)
    clipboardListener.startListening()
}

const stopClipboardListener = () => {
    clipboardListener.removeAllListeners()
    clipboardListener.stopListening()
}


const fetchClips = async (filter) => {
    const data = []
    const tableClient = await getTableClient()
    const days = filter == "today" ? 1 :
        filter == "this week" ? 7 :
            filter == "this month" ? 30 : 100000
    const filterDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000) // 1 days ago
    for await (const entity of tableClient.listEntities({
        queryOptions: {
            filter: odata`Timestamp ge ${filterDate}`,
        }
    })) {
        data.push({
            date: entity.timestamp,
            id: entity.rowKey,
            source: entity.partitionKey,
            text: entity.text
        })
    }

    return data.sort((a, b) => a.date > b.date ? -1 : 1)
}

ipcMain.handle('clipboard:fetchClips', async (ev, filter) => {
    return await fetchClips(filter)
})

module.exports = { getTableClient, startClipboardListener, stopClipboardListener }