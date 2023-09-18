import {Outlet, useLocation, useNavigate} from "react-router-dom";
import {Suspense, useEffect} from "react";
import {createRoute} from "../router/createRoute.ts";
import {ROUTES} from "../router/routes.ts";
import {Layout} from "antd";
import {Content} from "antd/es/layout/layout";
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
        <Layout style={{minHeight: "100vh"}}>
            <Content className="content">
                <Suspense fallback={<Spinner/>}>
                    <Outlet/>
                </Suspense>
            </Content>
        </Layout>
    );
};

export default Index;