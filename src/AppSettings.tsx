import { Button, Group, Stack, Switch } from "@mantine/core"
import { useEffect, useState } from "react"
import SettingsItems from "./SettingsItems"
import { substitutePath } from "./utils"

type Setting = {
    name: string
    key: string,
}

const settings: Setting[] = [
    {
        key: SettingsItems.enableColorPicker,
        name: "Enable color picker"
    },
    {
        key: SettingsItems.enableMediaControls,
        name: "Enable tray media controls"
    },
    {
        key: SettingsItems.enableRunOnLogin,
        name: "Enable run on login"
    },
    {
        key: SettingsItems.enableClipboardSync,
        name: "Enable clipboard Sync"
    }
]

const defaultState: SettingState[] = settings.map(el => ({
    key: el.key,
    value: false
}))

type SettingState = {
    key: string,
    value: boolean
}

const openSettingsFile = async () => {
    const path = "<userData>\\settings.json"
    const substitutedPath = await substitutePath(path)
    window["electronAPI"].openFolder(substitutedPath)
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
        try {
            await window["electronAPI"].setSettingValue(setting, value)
        } catch (e) { }
        await loadSetting(setting)
    }

    useEffect(() => {
        settings.forEach(el => {
            loadSetting(el.key)
        })
    }, [])

    return <Stack>
        {settings.map(el =>
            <Switch
                checked={settingsState.find(set => set.key == el.key).value}
                onChange={(ev) => changeSetting(el.key, ev.target.checked)}
                key={el.key}
                label={el.name} />
        )}
        <Group>
            <Button
                variant="default"
                onClick={() => openSettingsFile()}>
                Show settings file
            </Button>
        </Group>
    </Stack >
}