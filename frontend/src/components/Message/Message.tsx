import {FC} from "react";
import {Typography} from "antd";
// own modules
import * as classNames from "classnames";
// types
import {TMessageType} from "../../models/IStore/IChats.ts";
// styles
import "./message.scss";

const {Text} = Typography;

type TMessageProps = {
    side: "left" | "right"
} & TMessageType

const Message: FC<TMessageProps> = ({side, TEXT, AUDIO, VIDEO}) => {
    return (
        <div
            className={
                classNames("message",
                            "message__" + side,
                            "message__" + (AUDIO ? "audio" : (VIDEO ? "video" : "text"))
                )
            }
        >
            {
                <Text>{TEXT}</Text> ||
                AUDIO ||
                VIDEO
            }
        </div>
    );
};

export default Message;