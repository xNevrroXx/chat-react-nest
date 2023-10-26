import {Typography} from "antd";
import {FC} from "react";

const {Title} = Typography;

const ErrorPage: FC = () => {
    return (
        <section className="error-page">
            <Title>Not found</Title>
        </section>
    );
};

export default ErrorPage;