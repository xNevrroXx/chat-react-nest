import {RouteObject} from "react-router-dom";
import {createRoute} from "../createRoute.ts";
import {ROUTES} from "../routes.ts";
import {lazy} from "react";

// eslint-disable-next-line react-refresh/only-export-components
const AuthenticationPage = lazy(() => import("../../pages/Auth/Authentication.tsx"));

const authenticationRouter: RouteObject = {
        element: <AuthenticationPage/>,
        path: createRoute({path: ROUTES.AUTH})
    };

export {authenticationRouter};