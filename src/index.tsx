import { MantineProvider } from '@mantine/core';
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const root = ReactDOM.createRoot(
    document.getElementById('root') as HTMLElement
);


const theme = window.matchMedia("(prefers-color-scheme: dark)")

root.render(
    <React.StrictMode>
        <MantineProvider
            theme={{ colorScheme: theme.matches ? "dark" : "light", primaryColor: "orange" }} withGlobalStyles
        >
            <App />
        </MantineProvider>
    </React.StrictMode >
);
