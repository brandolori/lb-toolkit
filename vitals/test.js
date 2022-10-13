"use strict"
const { getHypervisor, setHypervisor } = require("./hypervisor")

setHypervisor(true)
    .then(e => console.log("Successo"))
    .catch(e => console.log("Fallimento: ", e))

getHypervisor()
    .then(e => console.log("Successo:", e))
    .catch(e => console.log("Fallimento: ", e))