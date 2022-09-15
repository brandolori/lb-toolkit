import { Paper, Stack, Textarea, TextInput, Text, Card, Highlight, Mark, Code, SegmentedControl, Switch, Group, ActionIcon, Loader } from "@mantine/core"
import { useEffect, useState } from "react"
import { AiOutlineReload } from "react-icons/ai"


export default () => {

    const [hypervisorState, setHypervisorState] = useState(false)
    const [hypervisorLoading, setHypervisorLoading] = useState(true)


    const changeHypervisorState = async (state: boolean) => {
        setHypervisorLoading(true)
        await window["electronAPI"].executeHypervisorCommand(state)
        await updateHypervisorState()
    }


    const updateHypervisorState = async () => {
        setHypervisorLoading(true)
        const state = await window["electronAPI"].retrieveHypervisorState()
        setHypervisorState(state)
        setHypervisorLoading(false)
    }

    useEffect(() => {
        updateHypervisorState()
    }, [])

    const settings = [{ name: "Hypervisor", enabled: hypervisorState, setEnabled: changeHypervisorState, loading: hypervisorLoading }]
    return <Stack >
        <Text>{settings.length} settings available</Text>

        {settings.map(el =>
            <Group>
                <Switch
                    disabled={el.loading}
                    checked={el.enabled}
                    onChange={(ev) => el.setEnabled(ev.target.checked)}
                    key={el.name}
                    label={el.name} />
                {el.loading &&
                    <Loader size="sm" />
                }
            </Group>
        )
        }
    </Stack >
}