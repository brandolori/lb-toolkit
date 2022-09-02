import { Paper, Stack, Textarea, TextInput, Text, Card, Highlight, Mark, Code, SegmentedControl, Switch } from "@mantine/core"
import { useEffect, useState } from "react"


export default () => {

    const [inputText, setInputText] = useState("")

    const [transform, setTransform] = useState("capitalize")

    const [toLowerCase, setToLowerCase] = useState(true)

    return <Stack>
        <SegmentedControl
            data={[
                { label: 'Uppercase first letter', value: 'capitalize' },
                { label: 'Uppercase', value: 'uppercase' },
                { label: 'Lowercase', value: 'lowercase' },
            ]}

            value={transform}

            onChange={(val) => setTransform(val)}
        />
        <Switch
            checked={toLowerCase}
            onChange={(ev) => setToLowerCase(ev.target.checked)}
            label="Enable toLowerCase() pre-pass"
        />
        <Textarea
            spellCheck={false}
            label="Text to check"
            onChange={(el) => setInputText(el.target.value)}
            withAsterisk />
        <Card shadow="md" p="xs">
            <Text style={{
                height: 100,
                overflowY: "auto",
                overflowWrap: "anywhere",
                whiteSpace: "pre-wrap",
                userSelect: "text",
                //@ts-ignore
                textTransform: transform
            }}>
                {toLowerCase ? inputText.toLowerCase() : inputText}
            </Text>
        </Card>
    </Stack>
}