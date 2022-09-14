import { AppShell, Container, Header, Text } from '@mantine/core';
import { useEffect, useState } from 'react';
import Navigation, { Route } from './Navigation';
import Updater from './Updater';
import Cleaner from './Cleaner';
import Home from './Home';
import Regex from './Regex';
import Wifi from './Wifi';
import Uppercase from './Uppercase';
import ClipboardSync from './ClipboardSync';

const titleBarHeight = 41
//window.navigator["windowControlsOverlay"].getTitlebarAreaRect().height

const TitleBar = () =>
    <Header
        style={{ display: "flex" }}
        height={titleBarHeight}
        className='header' p="xs">
        <Text style={{ marginTop: "auto", marginBottom: "auto" }} size="xs">
            <img style={{ height: 15, verticalAlign: "text-bottom", marginRight: 5 }} src="favicon.ico" alt="" />LB Toolkit
        </Text>
    </Header>

const App = () => {
    const [route, setRoute] = useState<Route>("home")

    useEffect(() => {
        window["electronAPI"].readyToShow()
    }, [])

    return <AppShell
        padding="md"
        header={<TitleBar />}
        navbar={<Navigation route={route} onChangeRoute={(route) => setRoute(route)} />}
    >
        <Container>

            {route == "home" &&
                <Home />}
            {route == "updater" &&
                <Updater />}
            {route == "cleaner" &&
                <Cleaner />}
            {route == "regex" &&
                <Regex />}
            {route == "wifi" &&
                <Wifi />}
            {route == "uppercase" &&
                <Uppercase />}
            {route == "clipboard" &&
                <ClipboardSync />}
        </Container>

    </AppShell>
}

export default App;
