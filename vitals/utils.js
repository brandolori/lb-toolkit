"use strict"
const ChildProcess = require("child_process")
const path = require("path")
const fs = require("fs")

const dirSize = (directory) => {
    const files = fs.readdirSync(directory)

    return files.reduce((accumulator, file) => {
        const stats = fs.statSync(path.join(directory, file))
        return stats.isFile()
            ? accumulator + stats.size
            : accumulator + dirSize(path.join(directory, file))
    }, 0)
}

const handleCommand = (command, args) => new Promise((res, rej) => {
    const proc = ChildProcess.spawn(command, args)

    let buffer = []
    proc.stdout.on("data", (data) => {

        buffer.push(data)
    })

    proc.on("close", () => {
        const finalStdout = buffer.join("")
        res(finalStdout)
    })
})

module.exports = { dirSize, handleCommand }