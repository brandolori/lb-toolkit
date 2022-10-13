"use strict"
var sudo = require('sudo-prompt')
const onString = "Auto"
const offString = "Off"

/**
 * 
 * @param {boolean} enabled 
 * @returns {Promise<void>}
 */
const setHypervisor = (enabled) => {
    const launchType = enabled ? onString : offString
    return new Promise((res, rej) => {
        sudo.exec(`bcdedit /set hypervisorlaunchtype ${launchType}`,
            { name: "lb toolkit" },
            (error) => {
                if (!error)
                    res()
                else
                    rej(error)
            }
        )
    })
}
/**
 * 
 * @returns {Promise<boolean>}
 */
const getHypervisor = () => {
    return new Promise((res, rej) => {
        sudo.exec(`bcdedit /enum`,
            { name: "lb toolkit" },
            (error, stdout) => {
                if (!error) {
                    let ret = /^\s*hypervisorlaunchtype\s* (.+)\s*$/gm.exec(stdout.toString())
                    res(ret[1] == onString ? true : false)
                }
                else
                    rej(error)
            }
        )
    })
}

module.exports = { setHypervisor, getHypervisor }