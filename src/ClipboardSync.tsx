import { ActionIcon, Alert, Button, Card, Group, NativeSelect, Space, Stack, Text } from "@mantine/core";
import { useEffect, useState } from "react";
import { AiOutlineReload, AiOutlineWarning } from "react-icons/ai";
import SettingsItems from "./SettingsItems";

type DateFilter = "today" | "this week" | "this month" | "all"

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
        const data = await window["electronAPI"].fetchClips(dateFilter)
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