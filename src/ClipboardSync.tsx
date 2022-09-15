import { AzureSASCredential, TableClient, odata } from "@azure/data-tables";
import { ActionIcon, Alert, Button, Card, Group, NativeSelect, Space, Stack, Text } from "@mantine/core";
import { useEffect, useState } from "react";
import { AiOutlineReload, AiOutlineWarning } from "react-icons/ai";
import SettingsItems from "./SettingsItems";

type DateFilter = "today" | "this week" | "this month" | "all"

const getTableClient = async () => {
    const account: string = await window["electronAPI"].getSettingValue(SettingsItems.azureStorageAccount)
    const SASToken: string = await window["electronAPI"].getSettingValue(SettingsItems.azureSASToken)
    const tableName: string = await window["electronAPI"].getSettingValue(SettingsItems.azureTableName)
    return new TableClient(
        `https://${account}.table.core.windows.net`,
        tableName,
        new AzureSASCredential(SASToken)
    )
}

const fetchClips = async (filter: DateFilter) => {
    const data: Clip[] = []
    const tableClient = await getTableClient()
    const days = filter == "today" ? 1 :
        filter == "this week" ? 7 :
            filter == "this month" ? 30 : 100000
    const filterDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000) // 1 days ago
    for await (const entity of tableClient.listEntities({
        queryOptions: {
            filter: odata`Timestamp ge ${filterDate}`,
        }
    })) {
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
    const [showSyncAlert, setSyncEnabled] = useState(false)
    const [dateFilter, setDateFilter] = useState<DateFilter>("today")

    const updateClips = async () => {
        setLoading(true)
        const data = await fetchClips(dateFilter)
        setClips(data)
        setLoading(false)
    }

    useEffect(() => {
        updateClips()
        window["electronAPI"].handleClipboardChange(() => updateClips())
        window["electronAPI"].getSettingValue(SettingsItems.enableClipboardSync)
            .then(value => setSyncEnabled(!value))
    }, [dateFilter])

    return <Stack>
        {showSyncAlert &&
            <Alert icon={<AiOutlineWarning size={16} />} title="Warning" >
                Clipboard sync is currently disabled. Enable it from the Home tab.
            </Alert>
        }
        <Group>
            <Text size="sm">
                Last {clips.length} clips from
            </Text>
            <NativeSelect
                size="sm"
                data={["today", "this week", "this month", "all"]}
                onChange={(ev) => setDateFilter(ev.target.value as DateFilter)}
            />
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