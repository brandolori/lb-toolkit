import { ActionIcon, AppShell, Button, Container, Group, Header, Loader, Navbar, Stack, Text } from '@mantine/core';
import React, { useEffect, useState } from 'react';
import { AiOutlineReload } from 'react-icons/ai'
import Navigation, { Route } from './Navigation';
import Updater from './Updater';
import "./App.css"
import Cleaner from './Cleaner';
import Main from './Main';

const titleBarHeight = 40
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

    </AppShell>
}

export default App;
