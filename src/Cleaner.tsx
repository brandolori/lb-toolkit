import { ActionIcon, Button, Group, Stack, Text } from "@mantine/core"
import { useEffect, useState } from "react"
import { AiOutlineReload } from "react-icons/ai"

const folders: { name: string, path: string }[] = [
    {
        path: `%USERPROFILE%\\Downloads`,
        name: "Downloads folder",
    },
    {
        path: "C:\\AMD",
        name: "AMD installer data",
    },
]

const substitute = async (path: string) => {

    let mutatedPath = path

    const reg = /%[A-Z]+%/g
    const promises = path.match(reg)?.map(async (subString) => {
        const varName = subString.replaceAll("%", "")
        const varValue = await window["electronAPI"].getEnvironmentVariable(varName)
        mutatedPath = mutatedPath.replace(subString, varValue)
    }) ?? [Promise.resolve()]

    await Promise.all(promises)
    return mutatedPath
}

export default () => {

    const [sizes, setSizes] = useState<{ path: string, size: number }[]>([])

    const [deleting, setDeleting] = useState<string[]>([])

    const calculateSize = async (path: string): Promise<number> => {

        const substitutedPath = await substitute(path)

        return await window["electronAPI"].calculateFolderSize(substitutedPath)
    }

    const calculateAllSizes = async () => {

        const promises = folders.map(async el => {
            const size = await calculateSize(el.path)
            return { path: el.path, size: size }
        })
        const values = await Promise.all(promises)
        setSizes(values)
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
            <ActionIcon onClick={() => calculateAllSizes()}>
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