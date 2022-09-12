import { Container } from "@mantine/core"
import { useEffect } from "react"
import ClipboardSync from "./ClipboardSync"

export default () => {
    useEffect(() => {
        window["electronAPI"].clipboardReadyToShow()
    }, [])
    return <Container className="header" py="xl">
        <ClipboardSync />
    </Container>
}