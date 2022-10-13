import { ActionIcon, Group, Stack, Text, Image, Space, LoadingOverlay, Alert } from "@mantine/core"
import { useEffect, useState } from "react"
import { AiOutlineCopy, AiOutlineReload, AiOutlineWarning } from "react-icons/ai"
import { generateWifiQRCode } from 'wifi-qr-code-generator'

const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
}

export default () => {

    const [qr, setQr] = useState("")
    const [ssid, setSsid] = useState("")
    const [password, setPassword] = useState("")
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(false)

    const retrieveConnectionDetails = async () => {
        try {
            setError(false)
            setLoading(true)
            const { ssid, password } = await window["electronAPI"].retrieveConnectionDetails()
            setSsid(ssid)
            setPassword(password)
            setLoading(false)
        }
        catch (e) {
            setError(true)
        }
    }

    useEffect(() => {
        retrieveConnectionDetails()
    }, [])

    useEffect(() => {
        const pr = generateWifiQRCode({
            ssid: ssid,
            password: password,
            encryption: 'WPA',
            hiddenSSID: false,
            outputFormat: { type: 'image/png' }
        })
        pr.then((data) => setQr(data))
    }, [ssid, password])


    return <Stack>
        {error &&
            <Alert icon={<AiOutlineWarning size={16} />} title="Error" color="red" >
                <Group>
                    An error occurred while retrieving wifi connection information
                    <ActionIcon variant="outline"
                        onClick={() => retrieveConnectionDetails()}>
                        <AiOutlineReload />
                    </ActionIcon>
                </Group>
            </Alert>}
        <div style={{ position: "relative", width: "fit-content", height: "fit-content" }}>
            <LoadingOverlay visible={loading || error} overlayBlur={2} />
            <img
                style={{ borderRadius: 4 }}
                width={200} height={200} src={qr} alt="" />
            <Image></Image>
        </div>
        <Space h="md" />
        <Group>
            <Text>
                SSID: <Text span weight={700}>{ssid}</Text>
            </Text>
            <ActionIcon variant="outline"
                onClick={() => copyToClipboard(ssid)}>
                <AiOutlineCopy />
            </ActionIcon>
        </Group>
        <Group>
            <Text>
                Password: <Text span weight={700}>{password}</Text>
            </Text>
            <ActionIcon variant="outline"
                onClick={() => copyToClipboard(password)}>
                <AiOutlineCopy />
            </ActionIcon>
        </Group>
    </Stack >
}