import React, {FC, Fragment, useCallback, useMemo, useRef} from "react";
import * as classNames from "classnames";
import {Button, theme, Typography} from "antd";
import {FileTwoTone, EditOutlined, DeleteOutlined} from "@ant-design/icons";
// own modules
import OriginalMessage from "../OriginalMessage/OriginalMessage.tsx";
import AudioElement from "../AudioElement/AudioElement.tsx";
import MessageReply from "../MessageReply/MessageReply.tsx";
import ForwardedMessage from "../ForwardedMessage/ForwardedMessage.tsx";
import ReplyOutlined from "../../icons/ReplyOutlined.tsx";
import PinOutlined from "../../icons/PinOutlined.tsx";
import ForwardOutlined from "../../icons/ForwardOutlined.tsx";
// types
import {checkIsMessage, IForwardedMessage, IMessage} from "../../models/IStore/IRoom.ts";
import {IFileForRender, IKnownAndUnknownFiles} from "../../models/IRoom.ts";
// styles
import "./message.scss";

const {useToken} = theme;
const {Text} = Typography;

interface IMessageProps {
    message: IMessage | IForwardedMessage;
    files: IKnownAndUnknownFiles;
    isMine: boolean;
    isVoice: boolean;
    handlePreview: (file: IFileForRender) => void;
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
                                        handlePreview,
                                        onChooseMessageForPin,
                                        onChooseMessageForEdit,
                                        onChooseMessageForDelete,
                                        onChooseMessageForReply,
                                        onChooseMessageForForward
                                    }) => {
    const {token} = useToken();
    const downloadLinkRef = useRef<HTMLAnchorElement | null>(null);

    const handleDownload = useCallback((fileInfo: IFileForRender) => {
        if (!downloadLinkRef.current) {
            return;
        }

        downloadLinkRef.current.href = fileInfo.blobUrl;
        downloadLinkRef.current.download = fileInfo.originalName.length > 0 ?
            fileInfo.originalName : "file".concat(fileInfo.extension);
        downloadLinkRef.current.click();
    }, []);

    const videoElem = useCallback((fileInfo: IFileForRender): JSX.Element => {
        return (
            <Fragment>
                <video
                    tabIndex={-1}
                    controls={true}
                    src={fileInfo.blobUrl}
                />
            </Fragment>
        );
    }, []);

    const imageElem = useCallback((fileInfo: IFileForRender): JSX.Element => {
        return (
            <Fragment>
                <img
                    alt={`attachment ${fileInfo.id}`}
                    src={fileInfo.blobUrl}
                />
            </Fragment>
        );
    }, []);

    const otherElem = useCallback((fileInfo: IFileForRender): JSX.Element => {
        return (
            <Fragment>
                <FileTwoTone/>
                <span className="message__attachment-file-name">{fileInfo.originalName}</span>
                <a style={{display: "none"}} ref={downloadLinkRef}/>
            </Fragment>
        );
    }, []);

    const knownAttachments = useMemo(() => {
        if (files.known.length === 0) {
            return null;
        }

        return files.known.map((fileInfo) => {
            let fileElem: JSX.Element;
            if (fileInfo.attachmentType === "video") {
                fileElem = videoElem(fileInfo);
            } else if (fileInfo.attachmentType === "image") {
                fileElem = imageElem(fileInfo);
            } else if (fileInfo.attachmentType === "audio") {
                // fileElem = audioElem(fileInfo); // todo add an audio element
            }

            return (
                <li
                    key={fileInfo.id}
                    className="message__attachment"
                    onClick={fileInfo.attachmentType !== "video" ? () => handlePreview(fileInfo) : undefined}
                >
                    {fileElem!}
                </li>
            );
        });
    }, [files, handlePreview, imageElem, videoElem]);

    const unknownAttachments = useMemo(() => {
        if (files.unknown.length === 0) {
            return null;
        }

        return files.unknown.map((fileInfo: IFileForRender) => {
            const fileElem = otherElem(fileInfo);

            return (
                <li
                    key={fileInfo.id}
                    className="message__attachment-unknown"
                    onClick={() => handleDownload(fileInfo)}
                >
                    {fileElem}
                </li>
            );
        });
    }, [files.unknown, handleDownload, otherElem]);

    const messageContent = useMemo(() => {
        if (!message) {
            return;
        }

        if (checkIsMessage(message)) {
            return (
                <Fragment>
                    { message.replyToMessage &&
                        <MessageReply message={message.replyToMessage}/>
                    }

                    {isVoice && (files.known.length === 1) ?
                        <div className="message__audio-element-wrapper">
                            <AudioElement
                                blob={files.known[0].blob}
                                blobURL={files.known[0].blobUrl}
                                width={200}
                                height={27}
                                alignCenter={true}
                                createdAt={message.createdAt}
                            />
                        </div>
                        :
                        <Fragment>
                            {knownAttachments &&
                                <ul className="message__attachments-wrapper">
                                    {knownAttachments}
                                    {!message.text && !unknownAttachments &&
                                        <Text className="message__time message__time_on-attachments">{message.createdAt}</Text>
                                    }
                                </ul>
                            }
                            {unknownAttachments &&
                                <ul
                                    className={classNames("message__attachments-unknown-wrapper", message.text && "message__attachments-unknown-wrapper_with-line")}
                                >
                                    {unknownAttachments}
                                    {!message.text && <Text style={{color: token.colorTextSecondary}} className="message__time-on-attachments">{message.createdAt}</Text> }
                                </ul>
                            }
                            {message.text &&
                                <OriginalMessage text={message.text} firstLinkInfo={message.firstLinkInfo} createdAt={message.createdAt}/>
                            }
                        </Fragment>
                    }
                </Fragment>
            );
        }

        return <ForwardedMessage message={message} isMine={isMine}/>;
    }, [message, isMine, isVoice, files.known, knownAttachments, unknownAttachments, token.colorTextSecondary]);

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