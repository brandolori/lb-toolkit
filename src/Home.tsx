import { Space, Stack, Title } from "@mantine/core";
import AppSettings from "./AppSettings";
import SystemSettings from "./SystemSettings"

export default () => <Stack>
    <Title order={3}>🖥️ System Settings</Title>
    <SystemSettings />

    <Space />

    <Title order={3}>📀 App Settings</Title>
    <AppSettings />
</Stack>