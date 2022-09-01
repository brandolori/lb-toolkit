import { ActionIcon, Button, Group, Stack, Text } from "@mantine/core"
import { useEffect, useState } from "react"
import { AiOutlineReload } from "react-icons/ai"

export default () => {

    const [upgradablePackages, setUpgradablePackages] = useState<string[]>([])
    const [currentlyUpgrading, setCurrentlyUpgrading] = useState<string[]>([])
    const [fetchingUpgrades, setFetchingUpgrades] = useState(false)

    const fetchUpgrades = async () => {
        setFetchingUpgrades(true)

        const fetchUpdateOutput: string = await window["electronAPI"].fetchUpdates()

        const outputLines = fetchUpdateOutput.split("\n")
        const startPos = outputLines[0].indexOf("Id")

        const idArray = outputLines
            .filter((el, i) => i > 1 && i < outputLines.length - 2)
            .map(el => {
                const stringStartingWithId = el.substring(startPos)
                const endPos = stringStartingWithId.indexOf(" ")
                return stringStartingWithId.substring(0, endPos)
            })

        setUpgradablePackages(idArray)
        setFetchingUpgrades(false)
    }

    const upgradePackage = async (packageName: string) => {
        setCurrentlyUpgrading((currentlyUpgrading) => currentlyUpgrading.concat([packageName]))
        await window["electronAPI"].updatePackage(packageName)
        setCurrentlyUpgrading((arr) => arr.filter(el => el != packageName))
        setUpgradablePackages((arr) => arr.filter(el => el != packageName))
    }

    useEffect(() => {
        fetchUpgrades()
    }, [])

    return <Stack>
        <Group>
            <Text>{upgradablePackages.length} upgradable packages</Text>
            <ActionIcon loading={fetchingUpgrades} onClick={() => fetchUpgrades()}>
                <AiOutlineReload />
            </ActionIcon>

        </Group>

        {upgradablePackages.map(el =>
            <Group key={el}>
                <Button
                    onClick={() => upgradePackage(el)}
                    key={el}>
                    {el}
                </Button>
                {
                    currentlyUpgrading.includes(el) &&
                    <ActionIcon loading />
                }
            </Group>
        )}
    </Stack>
}