import { ActionIcon, AppShell, Button, Container, Group, Header, Loader, Navbar, Stack, Text } from '@mantine/core';
import React, { useEffect, useState } from 'react';
import { AiOutlineReload } from 'react-icons/ai'
import Navigation, { Route } from './Navigation';
import Updater from './Updater';
import "./App.css"
import Cleaner from './Cleaner';
import Main from './Main';
import Regex from './Regex';
import Wifi from './Wifi';

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
        {route == "home" &&
            <Main />}
        {route == "updater" &&
            <Updater />}
        {route == "cleaner" &&
            <Cleaner />}
        {route == "regex" &&
            <Regex />}
        {route == "wifi" &&
            <Wifi/>}

    </AppShell>
}

export default App;
