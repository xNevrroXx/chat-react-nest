import React, {FC, useEffect, useState} from "react";
import {Typography} from "antd";
import * as classNames from "classnames";
// own modules
import AudioElement from "../AudioElement/AudioElement.tsx";
// types
import {IMessage, TFileType} from "../../models/IStore/IChats.ts";
// styles
import "./message.scss";

const {Text} = Typography;

type TMessageProps = {
    side: "left" | "right"
} & Omit<IMessage, "id" | "recipientId" | "senderId">

const Message: FC<TMessageProps> = ({side, text, files}) => {
    const [isVoice, setIsVoice] = useState<boolean>(false);
    const [blob, setBlob] = useState<Blob | null>(null);
    const [blobURL, setBlobURL] = useState<string | null>(null);

    useEffect(() => {
        if (!files || files.length !== 1) {
            return;
        }

        if (files.at(0)!.type === TFileType[TFileType.VOICE]) {
            const blob = new Blob([files.at(0)!.buffer], {type: "audio/webm"});
            setBlob(blob);
            setBlobURL(URL.createObjectURL(blob));
            setIsVoice(true);
        }
    }, [files]);


    return (
        <div
            className={
                classNames("message", "message__" + side)
            }
        >
            {isVoice && (blob && blobURL) ?
                <AudioElement
                    blob={blob}
                    blobURL={blobURL}
                    width={200}
                    height={35}
                />
                :
                <Text>{text}</Text>
            }
        </div>
    );
};

export default Message;