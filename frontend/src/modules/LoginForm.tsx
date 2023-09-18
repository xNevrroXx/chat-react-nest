import {FC, useState} from "react";
import {Button, Form, FormItemProps, Input, Typography} from "antd";
import {useFormik} from "formik";
import Paper from "../components/Paper/Paper.tsx";
import {type TLoginFormData} from "../models/IStore/IAuthentication.ts";
import {loginUserValidation} from "../validation";
import {toFormikValidationSchema} from "zod-formik-adapter";
import {TValueOf} from "../models/TUtils.ts";
import {useAppDispatch} from "../hooks/store.hook.ts";
import {login} from "../store/thunks/authentication.ts";

const {Title, Paragraph} = Typography;

interface ILoginForm {
    changeForm: () => void
}

const LoginForm: FC<ILoginForm> = ({changeForm}) => {
    const dispatch = useAppDispatch();
    const [hasClickedSubmit, setHasClickedSubmit] = useState<boolean>(false);

    const formik = useFormik<TLoginFormData>({
        initialValues: {
            email: "",
            password: ""
        },
        validationSchema: toFormikValidationSchema(loginUserValidation),
        onSubmit: (values, {setSubmitting, resetForm}) => {
            setSubmitting(false);
            void dispatch(login(values));
            resetForm({
                values: {...values, password: ""},
                errors: {}
            });
        }
    });

    const checkValidationStatus = (field: keyof TLoginFormData): TValueOf<Pick<FormItemProps<TLoginFormData>, "validateStatus">> => {
        if (!formik.errors[field]) {
            return formik.values[field] ? "success" : undefined;
        }

        return hasClickedSubmit ? "error" : "warning";
    };

    const handleSubmit = () => {
        setHasClickedSubmit(true);
    };

    return (
        <div>
            <div className="auth__top">
                <Title level={2}>Войти в аккаунт</Title>
                <Title level={5}>Пожалуйста, войдите в свой аккаунт</Title>
            </div>
            <Paper>
                <Form
                    className="auth__form"
                    name="basic"
                    initialValues={{remember: true}}
                    onFinish={formik.handleSubmit}
                    autoComplete="on"
                    onChange={formik.handleChange}
                >
                    <Form.Item
                        hasFeedback
                        help={formik.errors.email}
                        validateStatus={checkValidationStatus("email")}
                    >
                        <Input
                            name="email"
                            value={formik.values.email}
                            placeholder="E-mail"
                            size="large"
                        />
                    </Form.Item>

                    <Form.Item
                        hasFeedback
                        help={formik.errors.password}
                        validateStatus={checkValidationStatus("password")}
                    >
                        <Input.Password
                            name="password"
                            type="password"
                            value={formik.values.password}
                            placeholder="Пароль"
                            size="large"
                        />
                    </Form.Item>

                    <Form.Item>
                        <Button onClick={handleSubmit} size="large" className="auth__submit" type="primary" htmlType="submit">
                            Войти
                        </Button>
                    </Form.Item>
                </Form>
                <Paragraph className="auth__change-form" onClick={changeForm}>Создать аккаунт</Paragraph>
            </Paper>
        </div>
    );
};

export default LoginForm;