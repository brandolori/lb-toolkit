import { Paper, Stack, Textarea, TextInput, Text, Card, Highlight, Mark, Code } from "@mantine/core"
import { useEffect, useState } from "react"

type OutputData = { text: string, highlighted: boolean }

export default () => {

    const [regex, setRegex] = useState("")
    const [validRegex, setValidRegex] = useState(true)
    const [inputString, setInputString] = useState("")
    const [outputString, setOutputString] = useState<OutputData[]>([])

    useEffect(() => {
        let regExpObject: RegExp
        try {
            regExpObject = new RegExp(regex, "g")
        } catch (e) {
            setValidRegex(false)
            return
        }
        setValidRegex(true)

        let data = []

        var numGroups = (new RegExp(regex + '|')).exec('').length - 1;

        inputString.replace(regExpObject, (substr, a, b) => {
            data.push({ length: substr.length, start: numGroups > 0 ? b : a, text: substr })
            return ""
        })

        let outputArray: OutputData[] = []
        let index = 0
        data.forEach(el => {
            outputArray.push({
                highlighted: false,
                text: inputString.substring(index, el.start)
            })

            outputArray.push({
                highlighted: true,
                text: el.text
            })
            index = el.start + el.length
        })

        outputArray.push({ highlighted: false, text: inputString.substring(index) })

        setOutputString(outputArray)

    }, [regex, inputString])

    return <Stack style={{ height: "100%" }}>
        <TextInput
            autoFocus
            spellCheck={false}
            label="Regular Expression"
            onChange={(el) => setRegex(el.target.value)}
            withAsterisk
            error={!validRegex} />
        <Textarea
            spellCheck={false}
            label="Text to check"
            onChange={(el) => setInputString(el.target.value)}
            withAsterisk />
        <Card shadow="md" p="xs" style={{ flex: "1 1 100px", overflowY: "auto" }}>
            <pre style={{ margin: 0, overflowY: "auto", overflowWrap: "anywhere", whiteSpace: "pre-wrap" }}>
                {outputString.map((el, i) => el.highlighted
                    // gli elementi evidenziati sono sempre dispari
                    ? <Mark color={Math.round(i / 2) % 2 == 0 ? "orange" : "pink"} key={i}>{el.text}</Mark>
                    : <Text key={i} span>{el.text}</Text>
                )}
            </pre>
        </Card>
    </Stack>
}