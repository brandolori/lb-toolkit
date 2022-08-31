import { ActionIcon, Button, Group, Stack, Switch, Text } from "@mantine/core"
import { useEffect, useState } from "react"

type Setting = {
    name: string
    key: string,
}

const SettingsItem = {
    enableColorPicker: "enableColorPicker",
    enableMediaControls: "enableMediaControls",
    enableRunOnStartup: "enableRunOnStartup"
}

const settings: Setting[] = [
    {
        key: SettingsItem.enableColorPicker,
        name: "Enable color picker"
    },
    {
        key: SettingsItem.enableMediaControls,
        name: "Enable tray media controls"
    },
    {
        key: SettingsItem.enableRunOnStartup,
        name: "Enable run on startup"
    }
]

const defaultState: SettingState[] = settings.map(el => ({
    key: el.key,
    value: true
}))

type SettingState = {
    key: string,
    value: boolean
}

export default () => {

    const [settingsState, setSettingsState] = useState<SettingState[]>(defaultState)

    const loadSetting = async (setting: string) => {
        const value = await window["electronAPI"].getSettingValue(setting)
        setSettingsState((state) => state.map(el => el.key == setting
            ? { key: setting, value: value }
            : el))
    }

    const changeSetting = async (setting: string, value: boolean) => {
        await window["electronAPI"].setSettingValue(setting, value)
        await loadSetting(setting)
    }

    useEffect(() => {
        settings.forEach(el => {
            loadSetting(el.key)
        })
    }, [])

    return <Stack>
        <Text>{settings.length} settings available</Text>

        {settings.map(el =>
            <Switch
                checked={settingsState.find(set => set.key == el.key).value}
                onChange={(ev) => changeSetting(el.key, ev.target.checked)}
                key={el.key}
                label={el.name} />
        )}
    </Stack >
}