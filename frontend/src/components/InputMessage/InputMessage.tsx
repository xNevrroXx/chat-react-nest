import {FC, FormEventHandler, useState} from "react";
import {Col, Row} from "antd";
import {SmileTwoTone, PlusCircleTwoTone, SendOutlined, AudioTwoTone} from "@ant-design/icons";
import * as classNames from "classnames";
// own modules
import {IMessage} from "../../models/IStore/IChats.ts";
import {TValueOf} from "../../models/TUtils.ts";
// styles
import "./inputMessage.scss";

interface IInputMessage {
    onSendMessage: (text: TValueOf<Pick<IMessage, "text">>) => void
}

const InputMessage: FC<IInputMessage> = ({onSendMessage}) => {
    const [message, setMessage] = useState<string | null>(null);

    const onInput: FormEventHandler<HTMLDivElement> = (event) => {
        if ( !(event.target instanceof HTMLDivElement) ) {
            return;
        }

        if (event.target.innerText === "") {
            setMessage(null);
        }
        else {
            setMessage(event.target.innerHTML);
        }
    };

    const sendMessage = () => {
        if (!message || message.trim().length === 0) {
            return;
        }

        onSendMessage(message);
    };

    return (
        <Row className="input-message">
            <Col span={1}><PlusCircleTwoTone /></Col>
            <Col span={1}><AudioTwoTone /></Col>
            <Col span={20} className="input-message__field">
                <div
                    className="input-message__textbox"
                    role="textbox"
                    contentEditable={true}
                    aria-multiline={true}
                    tabIndex={0}
                    onInput={onInput}
                ></div>
                <div
                    className={classNames("input-message__placeholder", message && "input-message__placeholder_hidden")}
                >Ваше сообщение...</div>
                <div className="input-message__input-buttons"><SmileTwoTone /></div>
            </Col>
            <Col span={1}>
                <SendOutlined
                    className="input-message__send-btn"
                    onClick={sendMessage}
                />
            </Col>
        </Row>
    );
};

export default InputMessage;