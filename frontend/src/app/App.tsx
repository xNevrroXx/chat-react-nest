import {useEffect, useRef} from "react";
import {RouterProvider} from "react-router-dom";
// own modules
import {router} from "../router";
import {useAppDispatch} from "../hooks/store.hook.ts";
// actions
import {checkAuthentication} from "../store/thunks/authentication.ts";
import {ConfigProvider} from "antd";

function App() {
    const dispatch = useAppDispatch();
    const isFetchedRef = useRef<boolean>(false);

    useEffect(() => {
        if (isFetchedRef.current) {
            return;
        }
        isFetchedRef.current = true;
        if (localStorage.getItem("token")) {
            void dispatch(checkAuthentication());
        }
    }, [dispatch]);

    return (
        <ConfigProvider>
            <RouterProvider router={router}/>
        </ConfigProvider>
    );
}

export default App;
