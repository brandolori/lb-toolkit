import { ActionIcon, Button, Group, Stack, Text } from "@mantine/core"
import { useEffect, useState } from "react"
import { AiOutlineReload } from "react-icons/ai"

const folders: { name: string, path: string }[] = [
    {
        path: "<downloads>",
        name: "Downloads folder",
    },
    {
        path: "C:\\AMD",
        name: "AMD installer data",
    },
]

const substitute = async (path: string) => {

    let mutatedPath = path

    const envRegex = /%[A-Z]+%/g
    const envPromises = path.match(envRegex)?.map(async (subString) => {
        const envVarName = subString.replaceAll("%", "")
        const envVarValue = await window["electronAPI"].getEnvironmentVariable(envVarName)
        mutatedPath = mutatedPath.replace(subString, envVarValue)
    }) ?? [Promise.resolve()]
    await Promise.all(envPromises)

    const appPathRegex = /<[a-z]+>/g
    const appPathPromises = mutatedPath.match(appPathRegex)?.map(async (subString) => {
        const appPathName = subString.replace("<", "").replace(">", "")
        const appPathValue = await window["electronAPI"].appGetPath(appPathName)
        mutatedPath = mutatedPath.replace(subString, appPathValue)
    }) ?? [Promise.resolve()]
    await Promise.all(appPathPromises)

    return mutatedPath
}

export default () => {

    const [sizes, setSizes] = useState<{ path: string, size: number }[]>([])
    const [loading, setLoading] = useState(true)


    const calculateSize = async (path: string): Promise<number> => {

        const substitutedPath = await substitute(path)

        return await window["electronAPI"].calculateFolderSize(substitutedPath)
    }

    const calculateAllSizes = async () => {
        setLoading(true)
        const promises = folders.map(async el => {
            const size = await calculateSize(el.path)
            return { path: el.path, size: size }
        })
        const values = await Promise.all(promises)
        setSizes(values)
        setLoading(false)
    }

    const deleteFolder = async (path: string) => {
        const substitutedPath = await substitute(path)
        await window["electronAPI"].deleteFolder(substitutedPath)
        calculateAllSizes()
    }

    useEffect(() => {
        calculateAllSizes()
    }, [])

    const cleanableSize = sizes.reduce((a, b) => a + b.size, 0).toFixed(0)
    const cleanableFolders = sizes.filter(el => el.size > 0).length

    return <Stack>

        <Group>
            <Text>{cleanableSize} mb from {cleanableFolders} folder{cleanableFolders > 1 && "s"} can be cleaned</Text>
            <ActionIcon loading={loading} onClick={() => calculateAllSizes()}>
                <AiOutlineReload />
            </ActionIcon>

        </Group>

        {folders.map((el, i) =>
            <Group key={i}>
                <Text>{el.name}</Text>
                <Button
                    onClick={() => deleteFolder(el.path)}
                    disabled={!(sizes.find(size => size.path == el.path)
                        && sizes.find(size => size.path == el.path).size != 0)}>
                    Free {(sizes.find(size => size.path == el.path)?.size ?? 0).toFixed(0)} mb
                </Button>
            </Group>
        )}
    </Stack>
}