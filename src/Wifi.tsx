import { ActionIcon, Group, Stack, Text, Image, Space } from "@mantine/core"
import { useEffect, useState } from "react"
import { AiOutlineCopy } from "react-icons/ai"

const qrcode = require('wifi-qr-code-generator')

const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
}

export default () => {

    const [qr, setQr] = useState("")
    const [ssid, setSsid] = useState("ssid")
    const [password, setPassword] = useState("pwd")

    const retrieveConnectionDetails = async () => {
        const { ssid, password } = await window["electronAPI"].retrieveConnectionDetails()
        setSsid(ssid)
        setPassword(password)
    }

    useEffect(() => {
        retrieveConnectionDetails()
    })

    useEffect(() => {
        const pr = qrcode.generateWifiQRCode({
            ssid: ssid,
            password: password,
            encryption: 'WPA',
            hiddenSSID: false,
            outputFormat: { type: 'image/png' }
        })
        pr.then((data) => setQr(data))
    }, [ssid, password])


    return <Stack>
        <Image
            style={{ pointerEvents: "none" }}
            width={200} height={200}
            radius="sm"
            src={qr}
            alt="Random unsplash image"
            caption="Scan to connect"
        />
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
    </Stack>
}