import {createBrowserRouter} from "react-router-dom";
import {lazy} from "react";
import {authenticationRouter} from "./routes/authentication.tsx";
import {main} from "./routes/main.tsx";
import IndexPage from "../pages/Index.tsx";

// eslint-disable-next-line react-refresh/only-export-components
const ErrorPage = lazy(() => import("../pages/404/ErrorPage"));

const router = createBrowserRouter([
    {
        element: <IndexPage/>,
        path: "/",
        children: [
            authenticationRouter,
            main,
            {
                path: "*",
                element: <ErrorPage/>
            }
        ]
    }
]);

export {router};