import { AzureSASCredential, TableClient } from "@azure/data-tables";
import { ActionIcon, Alert, Button, Card, Group, Space, Stack, Text } from "@mantine/core";
import { useEffect, useState } from "react";
import { AiOutlineReload, AiOutlineWarning } from "react-icons/ai";
import SettingsItems from "./SettingsItems";

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
    const [syncEnabled, setSyncEnabled] = useState(true)

    const updateClips = async () => {
        setLoading(true)
        const data = await fetchClips()
        setClips(data)
        setLoading(false)
    }

    useEffect(() => {
        updateClips()
        window["electronAPI"].handleClipboardChange(() => updateClips())
        window["electronAPI"].getSettingValue(SettingsItems.enableClipboardSync)
            .then(value => setSyncEnabled(value))
    }, [])

    return <Stack>
        {!syncEnabled &&
            <Alert icon={<AiOutlineWarning size={16} />} title="Warning" >
                Clipboard sync is currently disabled. Enable it from the Home tab.
            </Alert>
        }
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