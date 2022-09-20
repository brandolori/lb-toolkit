import { MantineProvider } from '@mantine/core';
import { createRoot } from 'react-dom/client';
import { lazy } from "react"
import "./App.css"

const ClipboardStandalone = lazy(() => import('./ClipboardStandalone'))
const App = lazy(() => import('./App'))

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
