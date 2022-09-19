import { Space, Stack, Title, Text } from "@mantine/core";
import { useEffect, useState } from "react";
import AppSettings from "./AppSettings";
import SystemSettings from "./SystemSettings"

export default () => {

    const [appVersion, setAppVersion] = useState("")

    useEffect(() => {
        window["electronAPI"].appGetVersion()
            .then(ver => setAppVersion(ver))
    }, [])

    return <Stack style={{ height: "100%" }} justify="space-between">
        <Stack>

            <Title order={3}>🖥️ System Settings</Title>
            <SystemSettings />

            <Space />

            <Title order={3}>📀 App Settings</Title>
            <AppSettings />
        </Stack>
        <Text size="sm" align="right">v{appVersion}</Text>

    </Stack>;
}