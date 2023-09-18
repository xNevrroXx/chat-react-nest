import "./auth.scss";
import {lazy, Suspense, useState} from "react";
import {Spinner} from "../../components/Spinner/Spinner.tsx";

const LoginForm = lazy(() => import("../../modules/LoginForm.tsx"));
const RegisterForm = lazy(() => import("../../modules/RegisterForm.tsx"));

const Authentication = () => {
    const [isLoginForm, setIsLoginForm] = useState<boolean>(true);

    const changeForm = () => {
        setIsLoginForm(prev => !prev);
    };

    return (
        <section className="auth">
            <div className="auth__content">
                <Suspense fallback={<Spinner/>}>
                    {isLoginForm ?
                        <LoginForm changeForm={changeForm}/> :
                        <RegisterForm changeForm={changeForm}/>
                    }
                </Suspense>
            </div>
        </section>
    );
};

export default Authentication;