import React, {FC, Fragment, useCallback, useMemo} from "react";
import * as classNames from "classnames";
import {Button, Image, theme, Typography} from "antd";
import {FileTwoTone, EditOutlined, DeleteOutlined} from "@ant-design/icons";
// own modules
import OriginalMessage from "../OriginalMessage/OriginalMessage.tsx";
import AudioElement from "../AudioElement/AudioElement.tsx";
import MessageReply from "../MessageReply/MessageReply.tsx";
import ForwardedMessage from "../ForwardedMessage/ForwardedMessage.tsx";
import ReplyOutlined from "../../icons/ReplyOutlined.tsx";
import PinOutlined from "../../icons/PinOutlined.tsx";
import ForwardOutlined from "../../icons/ForwardOutlined.tsx";
import VideoPlayer from "../VideoPlayer/VideoPlayer.tsx";
import Time from "../Time/Time.tsx";
// types
import {checkIsMessage, IFile, IForwardedMessage, IMessage} from "../../models/IStore/IRoom.ts";
import {IKnownAndUnknownFiles} from "../../models/IRoom.ts";
// styles
import "./message.scss";

const {useToken} = theme;
const {Text} = Typography;

interface IMessageProps {
    message: IMessage | IForwardedMessage;
    files: IKnownAndUnknownFiles;
    isMine: boolean;
    isVoice: boolean;
    onChooseMessageForPin: () => void;
    onChooseMessageForEdit: () => void;
    onChooseMessageForDelete: () => void;
    onChooseMessageForReply: () => void;
    onChooseMessageForForward: () => void;
}

const Message: FC<IMessageProps> = ({
                                        message,
                                        isMine,
                                        isVoice,
                                        files,
                                        onChooseMessageForPin,
                                        onChooseMessageForEdit,
                                        onChooseMessageForDelete,
                                        onChooseMessageForReply,
                                        onChooseMessageForForward
                                    }) => {
    const {token} = useToken();

    const handleDownload = useCallback((fileInfo: IFile) => {
        const anchor = document.createElement("a");
        anchor.href = import.meta.env.VITE_BACKEND_BASE_URL + "/file?name=" + fileInfo.url;
        anchor.title = fileInfo.originalName;
        anchor.download = fileInfo.originalName;
        anchor.click();
    }, []);

    const imageElem = useCallback((fileInfo: IFile): JSX.Element => {
        return (
            <Image
                alt={`attachment ${fileInfo.id}`}
                src={import.meta.env.VITE_BACKEND_BASE_URL + "/file?name=" + fileInfo.url}
            />
        );
    }, []);

    const otherElem = useCallback((fileInfo: IFile): JSX.Element => {
        return (
            <Fragment>
                <FileTwoTone/>
                <p>
                    <Text className="message__attachment-file-name">{fileInfo.originalName}</Text><br/>
                    <Text style={{color: token.colorTextSecondary}}>{fileInfo.size.value} {fileInfo.size.unit}</Text>
                </p>
            </Fragment>
        );
    }, [token.colorTextSecondary]);

    const knownAttachments = useMemo(() => {
        if (files.known.length === 0) {
            return null;
        }

        return files.known.map((fileInfo) => {
            let fileElem: JSX.Element;
            if (fileInfo.attachmentType === "video") {
                fileElem = <VideoPlayer {...fileInfo}/>;
            } else if (fileInfo.attachmentType === "image") {
                fileElem = imageElem(fileInfo);
            } else if (fileInfo.attachmentType === "audio") {
                // fileElem = audioElem(fileInfo); // todo add an audio element
            }

            return (
                <li
                    key={fileInfo.id}
                    className="message__attachment"
                >
                    {fileElem!}
                </li>
            );
        });
    }, [files, imageElem]);

    const unknownAttachments = useMemo(() => {
        if (files.unknown.length === 0) {
            return null;
        }

        return files.unknown.map((fileInfo: IFile, index) => {
            const fileElem = otherElem(fileInfo);

            return (
                <li
                    key={fileInfo.id}
                    className="message__attachment-unknown"
                    onClick={() => handleDownload(fileInfo)}
                >
                    {fileElem}
                    {!message.text && index === files.unknown.length - 1
                        && <Time createdAt={message.createdAt} hasRead={message.hasRead} hasEdited={!!message.updatedAt}/>
                    }
                </li>
            );
        });
    }, [files.unknown, handleDownload, message.createdAt, message.hasRead, message.text, message.updatedAt, otherElem]);

    const messageContent = useMemo(() => {

        if (checkIsMessage(message)) {
            return (
                <Fragment>
                    { message.replyToMessage &&
                        <MessageReply message={message.replyToMessage}/>
                    }

                    {isVoice && (files.known.length === 1) ?
                        <div className="message__audio-element-wrapper">
                            <AudioElement
                                url={files.known[0].url}
                                width={200}
                                height={27}
                                alignCenter={true}
                                createdAt={message.createdAt}
                                size={files.known[0].size}
                            />
                        </div>
                        :
                        <Fragment>
                            {knownAttachments &&
                                <ul className="message__attachments-wrapper">
                                    {knownAttachments}
                                </ul>
                            }
                            {unknownAttachments &&
                                <ul
                                    className={classNames("message__attachments-unknown-wrapper", message.text && "message__attachments-unknown-wrapper_with-line")}
                                >
                                    {unknownAttachments}
                                </ul>
                            }
                            <OriginalMessage {...message}/>
                        </Fragment>
                    }
                </Fragment>
            );
        }

        return <ForwardedMessage message={message} isMine={isMine}/>;
    }, [message, isMine, isVoice, files.known, knownAttachments, unknownAttachments]);

    return (
        <div
            tabIndex={-1}
            id={message.id}
            data-message-id={message.id}
            className={
                classNames("message", isMine && "message_mine")
            }
        >
            <div className="message__content">
                {messageContent}
            </div>
            <div className="message__actions">
                <Button
                    type="text"
                    size="small"
                    title="Ответить"
                    icon={<ReplyOutlined/>}
                    onClick={onChooseMessageForReply}
                />
                {isMine && !isVoice &&
                    <Button
                        type="text"
                        size="small"
                        title="Изменить"
                        icon={<EditOutlined/>}
                        onClick={onChooseMessageForEdit}
                    />
                }
                <Button
                    type="text"
                    size="small"
                    title="Переслать"
                    icon={<ForwardOutlined/>}
                    onClick={onChooseMessageForForward}
                />
                <Button
                    type="text"
                    size="small"
                    title="Закрепить"
                    icon={<PinOutlined/>}
                    onClick={onChooseMessageForPin}
                />
                <Button
                    type="text"
                    size="small"
                    title="Удалить"
                    icon={<DeleteOutlined/>}
                    onClick={onChooseMessageForDelete}
                />
            </div>
        </div>
    );
};

export default Message;