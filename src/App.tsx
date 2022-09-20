import { AppShell, Container, Header, Text } from '@mantine/core';
import { lazy, useEffect, useState } from 'react';
import type { Route } from './Navigation';
import Navigation from './Navigation';

const Updater = lazy(() => import('./Updater'))
const Cleaner = lazy(() => import('./Cleaner'))
const Home = lazy(() => import('./Home'))
const Regex = lazy(() => import('./Regex'))
const Wifi = lazy(() => import('./Wifi'))
const Uppercase = lazy(() => import('./Uppercase'))
const ClipboardSync = lazy(() => import('./ClipboardSync'))

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
        <Container style={{ height: "100%" }}>

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
