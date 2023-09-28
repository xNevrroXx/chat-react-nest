import {FC, useEffect, useRef, useState} from "react";
import {Button, Col, Row} from "antd";
import {SmileTwoTone, PlusCircleTwoTone, SendOutlined, AudioTwoTone} from "@ant-design/icons";
import InputEmojiWithRef from "react-input-emoji";
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
    const [message, setMessage] = useState<string>("");

    const onChange = (str: string) => {
        console.log(str);
        setMessage(str);
    };

    const onKeyDown = (event: KeyboardEvent) => {
        if (event.key !== "Enter") {
            return;
        }

        sendMessage();
    };

    const sendMessage = () => {
        const trimmedMessage = message.trim();
        if (trimmedMessage.length === 0) {
            return;
        }

        onSendMessage(trimmedMessage);
    };

    return (
        <Row className="input-message">
            <Col span={1} className="input-message__btn-wrapper"><PlusCircleTwoTone/></Col>
            <Col span={1} className="input-message__btn-wrapper"><AudioTwoTone/></Col>
            <Col span={20} className="input-message__field">
                <InputEmojiWithRef
                    inputClass={classNames("input-message__textbox")}
                    tabIndex={0}
                    borderRadius={5}
                    borderColor={"rgb(207 222 243)"}
                    fontFamily={"Roboto, sans-serif"}

                    value={message}
                    onChange={onChange}
                    shouldReturn={true}
                    cleanOnEnter={true}
                    onKeyDown={onKeyDown}
                    placeholder={"Ваше сообщение"}
                />
            </Col>
            <Col span={1} className="input-message__btn-wrapper">
                <SendOutlined
                    className="input-message__send-btn"
                    onClick={sendMessage}
                />
            </Col>
        </Row>
    );
};

export default InputMessage;