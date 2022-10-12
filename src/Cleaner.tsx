import { ActionIcon, Button, Group, Stack, Text } from "@mantine/core"
import { useEffect, useState } from "react"
import { AiOutlineFolderOpen, AiOutlineReload } from "react-icons/ai"
import { substitutePath } from "./utils"

const folders: { name: string, path: string }[] = [
    {
        path: "<downloads>",
        name: "Downloads folder",
    },
    {
        path: "C:\\AMD",
        name: "AMD installer data",
    },
    {
        path: "%temp%",
        name: "Temp folder",
    },
    {
        path: "shell:RecycleBinFolder",
        name: "Recycle bin",
    },
]

export default () => {

    const [sizes, setSizes] = useState<{ path: string, size: number }[]>([])
    const [loading, setLoading] = useState(true)


    const calculateSize = async (path: string): Promise<number> => {

        const substitutedPath = await substitutePath(path)

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
        const substitutedPath = await substitutePath(path)
        await window["electronAPI"].deleteFolder(substitutedPath)
        calculateAllSizes()
    }

    const showFolder = async (path: string) => {
        const substitutedPath = await substitutePath(path)
        console.log(substitutedPath)
        window["electronAPI"].openFolder(substitutedPath)
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
                <ActionIcon variant="outline" onClick={() => showFolder(el.path)}>
                    <AiOutlineFolderOpen />
                </ActionIcon>
            </Group>
        )}
    </Stack>
}