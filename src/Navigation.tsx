import { Navbar, NavLink } from "@mantine/core";

export type RouteObj = {
    name: string,
    label: string,
    component: any
}

type RouteNavProps = {
    active: boolean
    onClick: () => void
    label: string
};

const RouteNav = ({ active, onClick, label }: RouteNavProps) => <NavLink
    style={{ cursor: "default" }}
    label={label}
    active={active}
    onClick={onClick}
/>

type NavigationProps = {
    route: string
    routes: RouteObj[]
    onChangeRoute: (route: string) => void
}

export default ({ route, routes, onChangeRoute }: NavigationProps) =>
    <Navbar width={{ base: 200 }} p="xs">
        {
            routes.map(el =>
                <RouteNav
                    active={route == el.name}
                    label={el.label}
                    onClick={() => onChangeRoute(el.name)}
                />
            )
        }
    </Navbar>