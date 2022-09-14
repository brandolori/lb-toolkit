const { AzureSASCredential, TableClient } = require("@azure/data-tables");
const { getSettingValue, SettingsItem } = require("./settings");

const account = getSettingValue(SettingsItem.azureStorageAccount)
const SASToken = getSettingValue(SettingsItem.azureSASToken)
const tableName = getSettingValue(SettingsItem.azureTableName)
const tableClient = new TableClient(
    `https://${account}.table.core.windows.net`,
    tableName,
    new AzureSASCredential(SASToken)
);

module.exports = tableClient