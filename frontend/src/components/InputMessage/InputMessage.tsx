import {FC, useState} from "react";
import {Row} from "antd";
// own modules
import InputDuringMessage from "./InputDuringMessage.tsx";
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
        setMessage(str);
    };

    const onKeyDown = (event: KeyboardEvent) => {
        if (event.key !== "Enter") {
            return;
        }

        sendMessage();
        if (event.key !== "Enter" || !(event.target instanceof HTMLDivElement)) {
            return;
        }

        if (event.target.innerText === "") {
            setMessage("");
        }
        else {
            setMessage(event.target.innerHTML);
        }
    };

    const sendMessage = () => {
        const trimmedMessage = message.trim();
        if (trimmedMessage.length === 0) {
            return;
        }

        setMessage("");
        onSendMessage(trimmedMessage);
    };

    return (
        <Row className="input-message">
            <InputDuringMessage
                message={message}
                sendMessage={sendMessage}
                onChange={onChange}
                onKeyDown={onKeyDown}
            />
        </Row>
    );
};

export default InputMessage;