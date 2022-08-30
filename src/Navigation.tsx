import { Navbar, NavLink } from "@mantine/core";

export type Route = "updater" | "home" | "cleaner"

export default ({ route, onChangeRoute }:
    { route: Route, onChangeRoute: (route: Route) => void }) =>
    <Navbar width={{ base: 200 }} p="xs">
        <NavLink
            label="Home"
            active={route == "home"}
            onClick={() => onChangeRoute("home")}
        />
        <NavLink
            label="Updater"
            active={route == "updater"}
            onClick={() => onChangeRoute("updater")}
        />
        <NavLink
            label="Cleaner"
            active={route == "cleaner"}
            onClick={() => onChangeRoute("cleaner")}
        />
    </Navbar>