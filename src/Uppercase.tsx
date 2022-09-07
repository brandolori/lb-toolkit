import { Paper, Stack, Textarea, TextInput, Text, Card, Highlight, Mark, Code, SegmentedControl, Switch } from "@mantine/core"
import { useEffect, useState } from "react"


export default () => {

    const [inputString, setInputText] = useState("")

    const [transform, setTransform] = useState("capitalize")

    const [toLowerCase, setToLowerCase] = useState(true)

    const [sentencedString, setSentencedString] = useState("")

    useEffect(() => {
        if (transform != "sentence")
            return

        const regex = /\b[^.!?]+[.!?]+/g
        let replacedString = ""
        let index = 0

        const startingString = toLowerCase
            ? inputString.toLowerCase()
            : inputString

        const outputString = startingString.replace(regex, (substr) => {
            console.log(substr)
            return substr.substring(0, 1).toUpperCase()
                + substr.substring(1)
        })

        setSentencedString(outputString)

    }, [inputString, transform, toLowerCase])

    return <Stack style={{ height: "100%" }}>
        <SegmentedControl
            data={[
                { label: 'Uppercase first letter', value: 'capitalize' },
                { label: 'Uppercase', value: 'uppercase' },
                { label: 'Lowercase', value: 'lowercase' },
                { label: 'Uppercase first of sentence', value: 'sentence' },
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
            autoFocus
            autosize
            minRows={2}
            maxRows={3}
            spellCheck={false}
            label="Input text"
            onChange={(el) => setInputText(el.target.value)}
            withAsterisk />
        <Card shadow="md" p="xs" style={{ flex: "1 1 100px", overflowY: "auto" }}>
            <Text style={{
                overflowY: "auto",
                overflowWrap: "anywhere",
                whiteSpace: "pre-wrap",
                userSelect: "text",
                //@ts-ignore
                textTransform: transform == "sentence"
                    ? undefined
                    : transform
            }}>
                {transform == "sentence"
                    ? sentencedString
                    : toLowerCase
                        ? inputString.toLowerCase()
                        : inputString}
            </Text>
        </Card>
    </Stack>
}