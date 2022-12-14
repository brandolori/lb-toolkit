import { AppShell, Container, Header, Text } from '@mantine/core'
import { useEffect, useState } from 'react'
import Navigation, { RouteObj } from './Navigation'
import Updater from './Updater'
import Cleaner from './Cleaner'
import Home from './Home'
import Regex from './Regex'
import Wifi from './Wifi'
import Uppercase from './Uppercase'
import ClipboardSync from './ClipboardSync'

const titleBarHeight = 41

const TitleBar = () =>
    <Header
        style={{ display: "flex" }}
        height={titleBarHeight}
        className='header' p="xs">
        <Text style={{ marginTop: "auto", marginBottom: "auto" }} size="xs">
            <img style={{ height: 15, verticalAlign: "text-bottom", marginRight: 5 }} src="favicon.ico" alt="" />LB Toolkit
        </Text>
    </Header>

const routes: RouteObj[] = [
    {
        label: "๐ง Home",
        name: "home",
        component: Home
    },
    {
        label: "๐ฆ Updater",
        name: "updater",
        component: Updater
    },
    {
        label: "๐งน Cleaner",
        name: "cleaner",
        component: Cleaner
    },
    {
        label: "โ๏ธ Regex checker",
        name: "regex",
        component: Regex
    },
    {
        label: "๐ต๏ธโโ๏ธ Wifi password",
        name: "wifi",
        component: Wifi
    },
    {
        label: "โ๏ธ Text Casing",
        name: "uppercase",
        component: Uppercase
    },
    {
        label: "โ๏ธ Clipboard",
        name: "clipboard",
        component: ClipboardSync
    },
]

const App = () => {
    const [route, setRoute] = useState(routes[0].name)

    useEffect(() => {
        window["electronAPI"].readyToShow()
    }, [])

    const RouteComponent = routes.find(el => el.name == route).component

    return <AppShell
        padding="md"
        header={<TitleBar />}
        navbar={<Navigation routes={routes} route={route} onChangeRoute={(route) => setRoute(route)} />}
    >
        <div style={{ position: "relative", height: "100%" }}>
            <Container style={{ position: "absolute", inset: 0, overflow: "auto" }} >
                <RouteComponent />
            </Container>
        </div>

    </AppShell>
}

export default App
