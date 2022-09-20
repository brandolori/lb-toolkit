import { MantineProvider } from '@mantine/core';
import { createRoot } from 'react-dom/client';
import ClipboardStandalone from './ClipboardStandalone';
import "./App.css"
import App from './App';


const theme = window.matchMedia("(prefers-color-scheme: dark)")

const params = new URLSearchParams(window.location.search);

const page = params.has("page")
    ? params.get("page")
    : ""

const root = createRoot(document.getElementById('root'))

root.render(
    <MantineProvider
        theme={{ colorScheme: theme.matches ? "dark" : "light", primaryColor: "orange" }} withGlobalStyles
    >
        {
            page == "clipboard"
                ? <ClipboardStandalone />
                : <App />
        }
    </MantineProvider>
);
