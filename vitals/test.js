const wifiPassword = require("./getWifiPassword");

const wifiSSID = require("./getWifiSSID")


wifiSSID()
    .then(ssid => wifiPassword(ssid))
    .then(password => {
        console.log(password);
    });