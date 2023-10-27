import React, {FC, Fragment, useCallback, useMemo, useRef} from "react";
import * as classNames from "classnames";
import {Button} from "antd";
import {FileTwoTone, EditOutlined} from "@ant-design/icons";
// own modules
import OriginalMessage from "../OriginalMessage/OriginalMessage.tsx";
import AudioElement from "../AudioElement/AudioElement.tsx";
import MessageReply from "../MessageReply/MessageReply.tsx";
import ForwardedMessage from "../ForwardedMessage/ForwardedMessage.tsx";
import ReplyOutlined from "../../icons/ReplyOutlined.tsx";
import PinOutlined from "../../icons/PinOutlined.tsx";
import ForwardOutlined from "../../icons/ForwardOutlined.tsx";
// types
import {checkIsMessage, IForwardedMessage, IMessage} from "../../models/IStore/IChats.ts";
import {IFileForRender, IKnownAndUnknownFiles} from "../../models/IChat.ts";
// styles
import "./message.scss";

interface IMessageProps {
    message: IMessage | IForwardedMessage;
    links: string[];
    isMine: boolean;
    files: IKnownAndUnknownFiles;
    isVoice: boolean;
    handlePreview: (file: IFileForRender) => void;
    onClickMessageForEdit: () => void;
    onChooseMessageForReply: () => void;
    onChooseMessageForForward: () => void;
}

const DumbMessage: FC<IMessageProps> = ({
                                            links,
                                            message,
                                            isMine,
                                            isVoice,
                                            files,
                                            handlePreview,
                                            onClickMessageForEdit,
                                            onChooseMessageForReply,
                                            onChooseMessageForForward
                                        }) => {
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
                    {
                        message.replyToMessage &&
                        <MessageReply message={message.replyToMessage}/>
                    }
                    {isVoice && (files.known.length === 1) ?
                        <div className="message__audio-element-wrapper">
                            <AudioElement
                                blob={files.known[0].blob}
                                blobURL={files.known[0].blobUrl}
                                width={200}
                                height={35}
                                alignCenter={true}
                            />
                        </div>
                        :
                        <Fragment>
                            {knownAttachments &&
                                <div className="message__attachments-wrapper">
                                    {knownAttachments}
                                </div>
                            }
                            {unknownAttachments &&
                                <div
                                    className={classNames("message__attachments-unknown-wrapper", message.text && "message__attachments-unknown-wrapper_with-line")}>
                                    {unknownAttachments}
                                </div>
                            }
                            { message.text &&
                                <OriginalMessage text={message.text} links={links}/>
                            }
                        </Fragment>
                    }
                </Fragment>
            );
        }

        return <ForwardedMessage message={message} isMine={isMine}/>;
    }, [links, knownAttachments, unknownAttachments, files, isVoice, message, isMine]);

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
                {isMine &&
                    <Button
                        type="text"
                        size="small"
                        title="Изменить"
                        icon={<EditOutlined/>}
                        onClick={onClickMessageForEdit}
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
                />
            </div>
        </div>
    );
};

export default DumbMessage;