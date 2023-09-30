import React, {FC} from "react";
import {Col} from "antd";
import {PlusCircleTwoTone, SendOutlined} from "@ant-design/icons";
import InputEmojiWithRef from "react-input-emoji";
import * as classNames from "classnames";

interface IInputDuringMessageProps {
    message: string;
    sendMessage: () => void;
    onChange: (str: string) => void;
    onKeyDown: (event: KeyboardEvent) => void;
}

const InputDuringMessage: FC<IInputDuringMessageProps> = ({
                                                              message,
                                                              sendMessage,
                                                              onChange,
                                                              onKeyDown,
                                                          }) => {
    return (
        <>
            <Col span={1} className="input-message__btn-wrapper"><PlusCircleTwoTone/></Col>
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
        </>
    );
};

export default InputDuringMessage;