import { Navbar, NavLink } from "@mantine/core";

export type Route = "updater" | "home" | "cleaner" | "regex"

const RouteNav = ({ currentRoute, routeName, onChangeRoute, label }:
    { currentRoute: Route, routeName: Route, onChangeRoute: (route: Route) => void, label: string }) => <NavLink
        label={label}
        active={currentRoute == routeName}
        onClick={() => onChangeRoute(routeName)}
    />

export default ({ route, onChangeRoute }:
    { route: Route, onChangeRoute: (route: Route) => void }) =>
    <Navbar width={{ base: 200 }} p="xs">
        <RouteNav
            currentRoute={route}
            label="🔧 Home"
            onChangeRoute={onChangeRoute}
            routeName="home" />
        <RouteNav
            currentRoute={route}
            label="📦 Updater"
            onChangeRoute={onChangeRoute}
            routeName="updater" />
        <RouteNav
            currentRoute={route}
            label="🧹 Cleaner"
            onChangeRoute={onChangeRoute}
            routeName="cleaner" />
        <RouteNav
            currentRoute={route}
            label="⚙️ Regex checker"
            onChangeRoute={onChangeRoute}
            routeName="regex" />
    </Navbar>