const { app } = require("electron")

const atLoginFlag = "--login"

const isLogin = () => process.argv.includes(atLoginFlag)

const registerAtLogin = () => {
    app.setLoginItemSettings({ openAtLogin: true, args: [atLoginFlag] })
}

const unregisterAtLogin = () => {
    app.setLoginItemSettings({ openAtLogin: false })
}

module.exports = { isLogin, registerAtLogin, unregisterAtLogin }