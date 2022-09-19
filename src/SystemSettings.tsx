import { Stack, Text, Switch, Group, NativeSelect } from "@mantine/core"
import { useEffect, useState } from "react"

type SettingsType = {
    name: string,
    state: any,
    onChange: (state: any) => void,
    loading: boolean,
    type: "toggle" | "optionset",
    values?: any[]
}


export default () => {

    const [hypervisorState, setHypervisorState] = useState(false)
    const [hypervisorLoading, setHypervisorLoading] = useState(true)

    const updateHypervisorState = async () => {
        setHypervisorLoading(true)
        const state = await window["electronAPI"].retrieveHypervisorState()
        setHypervisorState(state)
        setHypervisorLoading(false)
    }

    const changeHypervisorState = async (state: boolean) => {
        setHypervisorLoading(true)
        setHypervisorState(state)
        await window["electronAPI"].executeHypervisorCommand(state)
        await updateHypervisorState()
    }

    useEffect(() => {
        updateHypervisorState()
    }, [])

    const [refreshRate, setRefreshRate] = useState("60")
    const [refreshRateValues, setRefreshRateValues] = useState(["60"])
    const [refreshRateLoading, setRefreshLoading] = useState(true)

    const updateRefreshState = async () => {
        setRefreshLoading(true)
        const state = await window["electronAPI"].currentRefreshRate()
        const values = await window["electronAPI"].listRefreshRates()
        setRefreshRate(state)
        setRefreshRateValues(values)
        setRefreshLoading(false)
    }

    const changeRefreshRate = async (state: boolean) => {
        setRefreshLoading(true)
        await window["electronAPI"].setRefreshRate(state)
        await updateRefreshState()
    }

    useEffect(() => {
        updateRefreshState()
    }, [])

    const settings: SettingsType[] = [
        { name: "Hypervisor", state: hypervisorState, onChange: changeHypervisorState, loading: hypervisorLoading, type: "toggle" },
        { name: "Refresh Rate", state: refreshRate, onChange: changeRefreshRate, loading: refreshRateLoading, type: "optionset", values: refreshRateValues },
    ]

    return <Stack >
        {settings.map(el =>
            <Group key={el.name}>
                {el.type == "toggle" &&
                    <>
                        <Switch
                            disabled={el.loading}
                            checked={el.state}
                            onChange={(ev) => el.onChange(ev.target.checked)}
                            label={el.name}
                            key={el.name} />
                    </>}
                {el.type == "optionset" &&
                    <>
                        <NativeSelect
                            disabled={el.loading}
                            size="sm"
                            data={el.values}
                            value={el.state}
                            onChange={(ev) => el.onChange(ev.target.value)} />
                        <Text size="sm">{el.name}</Text>
                    </>}
            </Group>
        )
        }
    </Stack >
}