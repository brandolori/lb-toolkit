import { ActionIcon, AppShell, Button, Container, Group, Header, Loader, Navbar, Stack, Text } from '@mantine/core';
import React, { useEffect, useState } from 'react';
import { AiOutlineReload } from 'react-icons/ai'
import Navigation, { Route } from './Navigation';
import Updater from './Updater';
import "./App.css"
import Cleaner from './Cleaner';
import Main from './Main';

const App = () => {
    const [route, setRoute] = useState<Route>("home")

    return <AppShell
        padding="md"
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
