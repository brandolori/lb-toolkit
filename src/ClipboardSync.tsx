import { AzureSASCredential, TableClient } from "@azure/data-tables";
import { ActionIcon, Button, Card, Group, Space, Stack, Text } from "@mantine/core";
import { useEffect, useState } from "react";
import { AiOutlineReload } from "react-icons/ai";

const account = "lbtoolkitkeyboard";
const SASToken = "?sv=2021-06-08&ss=t&srt=sco&sp=rwdlacu&se=2052-09-12T15:48:19Z&st=2022-09-12T07:48:19Z&spr=https&sig=OK5t7De%2B9ElUfVtxC%2BBq0OiZasMbz%2BIbgnidHMBRDYY%3D";
const tableName = "cpliboard"
const tableClient = new TableClient(
    `https://${account}.table.core.windows.net`,
    tableName,
    new AzureSASCredential(SASToken)
);

const fetchClips = async () => {
    const data: Clip[] = []
    for await (const entity of tableClient.listEntities()) {
        data.push({
            date: entity.timestamp,
            id: entity.rowKey,
            source: entity.partitionKey as ClipSource,
            text: entity.text as string
        })
    }

    return data.sort((a, b) => a.date > b.date ? -1 : 1)
}

type ClipSource = "pc" | "phone"

type Clip = {
    id: string,
    date: string,
    text: string,
    source: ClipSource
}

export default () => {
    const [clips, setClips] = useState<Clip[]>([])
    const [loading, setLoading] = useState(false)

    const updateClips = async () => {
        setLoading(true)
        const data = await fetchClips()
        setClips(data)
        setLoading(false)
    }

    useEffect(() => {
        updateClips()
        window["electronAPI"].handleClipboardChange(() => updateClips())
    }, [])

    return <Stack>
        <Group>
            <Text>
                Showing the latest {clips.length} clips
            </Text>
            <ActionIcon loading={loading} onClick={() => updateClips()}>
                <AiOutlineReload />
            </ActionIcon>
        </Group>
        {
            clips.map(el =>
                <Card key={el.id} onClick={() => window["electronAPI"].clipboardPaste(el.text)}>
                    <Text style={{ overflowWrap: "anywhere", userSelect: "text" }}>
                        {el.text}
                    </Text>
                    <Space h="md" />
                    <Group position="apart" align="end" >
                        <Group>
                            <Text color="dimmed" size="xs" weight="bold">
                                {el.source == "pc"
                                    ? "PC"
                                    : el.source == "phone"
                                        ? "PHONE"
                                        : "UNKNOWN"}
                            </Text>
                            <Text color="dimmed" size="xs" weight="bold" >
                                {new Date(el.date).toLocaleString("en-uk")}
                            </Text>
                        </Group>
                        <Button size="xs" variant="light">
                            Copy
                        </Button>
                    </Group>
                </Card>)
        }
    </Stack>
}