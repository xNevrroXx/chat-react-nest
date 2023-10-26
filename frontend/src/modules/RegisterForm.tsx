import {FC, useState} from "react";
import {Button, Form, FormItemProps, Input, Select, Typography} from "antd";
import {useFormik} from "formik";
import Paper from "../components/Paper/Paper.tsx";
import {IUserAuth, Sex, TRegisterFormData} from "../models/IStore/IAuthentication.ts";
import {toFormikValidationSchema} from "zod-formik-adapter";
import {registerUserValidation} from "../validation";
import {TValueOf} from "../models/TUtils.ts";
import {useAppDispatch} from "../hooks/store.hook.ts";
import {registration} from "../store/thunks/authentication.ts";

const {Title, Paragraph} = Typography;
const {Option} = Select;

interface IRegisterForm {
    changeForm: () => void
}

const RegisterForm: FC<IRegisterForm> = ({changeForm}) => {
    const dispatch = useAppDispatch();
    const [hasClickedSubmit, setHasClickedSubmit] = useState<boolean>(false);

    const formik = useFormik<TRegisterFormData>({
        initialValues: {
            email: "",
            name: "",
            surname: "",
            sex: Sex.MALE,
            age: 12,
            password: "",
            passwordConfirmation: ""
        },
        validationSchema: toFormikValidationSchema(registerUserValidation),
        onSubmit: (values, {setSubmitting, resetForm}) => {
            setSubmitting(false);
            void dispatch(registration(values));
            resetForm({
                values: {...values, password: "", passwordConfirmation: ""},
                errors: {}
            });
        }
    });

    const checkValidationStatus = (field: keyof TRegisterFormData): TValueOf<Pick<FormItemProps<TRegisterFormData>, "validateStatus">> => {
        if (!formik.errors[field]) {
            return formik.values[field] ? "success" : undefined;
        }

        return hasClickedSubmit ? "error" : "warning";
    };

    const onSexChange = (value: TValueOf<Pick<IUserAuth, "sex">>) => {
        void formik.setFieldValue("sex", value);
    };

    const handleSubmit = () => {
        setHasClickedSubmit(true);
    };

    return (
        <div>
            <div className="auth__top">
                <Title level={2}>Регистрация</Title>
                <Title level={5}>Для входа в чат вам нужно зарегистрироваться</Title>
            </div>
            <Paper>
                <Form
                    className="auth__form"
                    name="basic"
                    initialValues={{remember: true}}
                    onFinish={formik.handleSubmit}
                    autoComplete="off"
                    onChange={formik.handleChange}
                >
                    <Form.Item
                        validateStatus={checkValidationStatus("email")}
                        help={formik.errors.email}
                        hasFeedback
                    >
                        <Input
                            name="email"
                            value={formik.values.email}
                            placeholder="E-mail"
                            size="large"
                        />
                    </Form.Item>

                    <Form.Item
                        validateStatus={checkValidationStatus("name")}
                        help={formik.errors.name}
                        hasFeedback
                    >
                        <Input
                            name="name"
                            value={formik.values.name}
                            placeholder="Ваше имя"
                            size="large"
                        />
                    </Form.Item>

                    <Form.Item
                        validateStatus={checkValidationStatus("surname")}
                        help={formik.errors.surname}
                        hasFeedback
                    >
                        <Input
                            name="surname"
                            value={formik.values.surname}
                            placeholder="Ваша фамилия"
                            size="large"
                        />
                    </Form.Item>

                    <Form.Item
                        name="sex"
                        validateStatus={checkValidationStatus("sex")}
                        help={formik.errors.sex}
                        hasFeedback
                    >
                        <Select
                            placeholder="Пол"
                            value={formik.values.sex}
                            onChange={onSexChange}
                        >
                            <Option value={Sex.MALE}>муж</Option>
                            <Option value={Sex.FEMALE}>жен</Option>
                        </Select>
                    </Form.Item>

                    <Form.Item
                        validateStatus={checkValidationStatus("password")}
                        help={formik.errors.password}
                        hasFeedback
                    >
                        <Input.Password
                            name="password"
                            type="password"
                            value={formik.values.password}
                            placeholder="Пароль"
                            size="large"
                        />
                    </Form.Item>

                    <Form.Item
                        validateStatus={checkValidationStatus("passwordConfirmation")}
                        help={formik.errors.passwordConfirmation}
                        hasFeedback
                    >
                        <Input.Password
                            name="passwordConfirmation"
                            type="password"
                            value={formik.values.passwordConfirmation}
                            placeholder="Повторите пароль"
                            size="large"
                        />
                    </Form.Item>

                    <Form.Item>
                        <Button onClick={handleSubmit} size="large" className="auth__submit" type="primary"
                                htmlType="submit">
                            Зарегистрироваться
                        </Button>
                    </Form.Item>
                </Form>

                <Paragraph className="auth__change-form" onClick={changeForm}>Войти в аккаунт</Paragraph>
            </Paper>
        </div>
    );
};

export default RegisterForm;