import {Outlet, useLocation, useNavigate} from "react-router-dom";
import {Suspense, useEffect} from "react";
import {Layout} from "antd";
import {createRoute} from "../router/createRoute.ts";
import {ROUTES} from "../router/routes.ts";
import {Spinner} from "../components/Spinner/Spinner.tsx";

const Index = () => {
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        if (location.pathname != "/") {
            return;
        }

        navigate(createRoute({
            path: ROUTES.AUTH
        }));
    }, [location, navigate]);

    return (
        <Layout style={{minHeight: "100vh", display: "flex", justifyContent: "center", alignItems: "center"}}>
            <Suspense fallback={<Spinner/>}>
                <Outlet/>
            </Suspense>
        </Layout>
    );
};

export default Index;