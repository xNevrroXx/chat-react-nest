import {lazy, Suspense, useCallback, useState} from "react";
import {Spinner} from "../../components/Spinner/Spinner.tsx";
import {Flex, Layout} from "antd";
import "./auth.scss";

const {Content} = Layout;

const LoginForm = lazy(() => import("../../modules/LoginForm.tsx"));
const RegisterForm = lazy(() => import("../../modules/RegisterForm.tsx"));

const Authentication = () => {
    const [isLoginForm, setIsLoginForm] = useState<boolean>(true);

    const changeForm = useCallback(() => {
        setIsLoginForm(prev => !prev);
    }, []);

    return (
        <Content className="auth">
            <Flex justify="center" align="center" style={{height: "100%"}}>
                <div className="auth__content">
                    <Suspense fallback={<Spinner/>}>
                        {isLoginForm ?
                            <LoginForm changeForm={changeForm}/> :
                            <RegisterForm changeForm={changeForm}/>
                        }
                    </Suspense>
                </div>
            </Flex>
        </Content>
    );
};

export default Authentication;