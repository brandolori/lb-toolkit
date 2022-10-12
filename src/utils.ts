const substitutePath = async (path: string) => {

    let mutatedPath = path

    const envRegex = /%[A-Za-z]+%/g
    const envPromises = path.match(envRegex)?.map(async (subString) => {
        const envVarName = subString.replaceAll("%", "")
        const envVarValue = await window["electronAPI"].getEnvironmentVariable(envVarName)
        mutatedPath = mutatedPath.replace(subString, envVarValue)
    }) ?? [Promise.resolve()]
    await Promise.all(envPromises)

    const appPathRegex = /<[A-Za-z]+>/g
    const appPathPromises = mutatedPath.match(appPathRegex)?.map(async (subString) => {
        const appPathName = subString.replace("<", "").replace(">", "")
        const appPathValue = await window["electronAPI"].appGetPath(appPathName)
        mutatedPath = mutatedPath.replace(subString, appPathValue)
    }) ?? [Promise.resolve()]
    await Promise.all(appPathPromises)

    return mutatedPath
}

export { substitutePath }