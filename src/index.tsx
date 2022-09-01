import { MantineProvider } from '@mantine/core';
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const root = ReactDOM.createRoot(
    document.getElementById('root') as HTMLElement
);
root.render(
    <React.StrictMode>
        <MantineProvider theme={{ colorScheme: 'dark', primaryColor: "orange" }} withGlobalStyles >
            <App />
        </MantineProvider>
    </React.StrictMode >
);
