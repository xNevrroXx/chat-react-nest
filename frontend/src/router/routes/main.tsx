import {RouteObject} from "react-router-dom";
import {ROUTES} from "../routes.ts";
import {createRoute} from "../createRoute.ts";
import {lazy} from "react";

// eslint-disable-next-line react-refresh/only-export-components
const MainPage = lazy(() => import("../../pages/Main/Main.tsx"));

const main: RouteObject = {
    element: <MainPage/>,
    path: createRoute({path: ROUTES.MAIN})
};

export {main};