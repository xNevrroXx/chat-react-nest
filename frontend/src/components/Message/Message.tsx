import React, {FC, Fragment, useCallback, useMemo, useRef} from "react";
import * as classNames from "classnames";
import {Button, Modal} from "antd";
import {FileTwoTone} from "@ant-design/icons";
import {Interweave} from "interweave";
// own modules
import AudioElement from "../AudioElement/AudioElement.tsx";
import ReplyOutlined from "../../icons/ReplyOutlined.tsx";
import PinOutlined from "../../icons/PinOutlined.tsx";
import MessageReply from "../MessageReply/MessageReply.tsx";
// types
import {IFileForRender, IMessage} from "../../models/IStore/IChats.ts";
// styles
import "./message.scss";

type TMessageProps = {
    side: "left" | "right",
    files: IFileForRender[];
    isVoice: boolean;
    isPreviewOpen: boolean;
    previewFile: IFileForRender | null;
    handlePreview: (file: IFileForRender) => void;
    handleCancel: () => void;
    chooseMessageForReply: () => void;
    message: IMessage
}

const Message: FC<TMessageProps> = ({
                                        message,
                                        side,
                                        isVoice,
                                        files,
                                        isPreviewOpen,
                                        previewFile,
                                        handlePreview,
                                        handleCancel,
                                        chooseMessageForReply
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
            <div
                onClick={() => handleDownload(fileInfo)}
                className="message__attachment-unknown"
            >
                <FileTwoTone/>
                <span className="message__attachment-file-name">{fileInfo.originalName}</span>
                <a style={{display: "none"}} ref={downloadLinkRef}/>
            </div>
        );
    }, []);

    const attachments = useMemo(() => {
        if (files.length === 0) {
            return null;
        }

        return files.map((fileInfo: IFileForRender) => {
            let fileType: "video" | "audio" | "image" | "unknown";
            let fileElem: JSX.Element;
            if (fileInfo.mimeType.includes("video")) {
                fileType = "video";
                fileElem = videoElem(fileInfo);
            } else if (fileInfo.mimeType.includes("image")) {
                fileType = "image";
                fileElem = imageElem(fileInfo);
            } else if (fileInfo.mimeType.includes("audio")) {
                fileType = "audio";
                // fileElem = imageElem(fileInfo); // todo add audio element
            } else {
                fileType = "unknown";
                fileElem = otherElem(fileInfo);
            }

            return (
                <li
                    key={fileInfo.id}
                    className="message__attachment"
                    onClick={fileType !== "unknown" ? (() => handlePreview(fileInfo)) : undefined}
                >
                    {fileElem!}
                </li>
            );
        });
    }, [files, imageElem, otherElem, videoElem]);

    return (
        <div
            id={message.id}
            data-message-id={message.id}
            className={
                classNames("message", "message__" + side)
            }
        >
            <div className="message__actions">
                <Button
                    type="text"
                    size="small"
                    title="Закрепить"
                    icon={<PinOutlined/>}
                />
                <Button
                    type="text"
                    size="small"
                    title="Ответить"
                    icon={<ReplyOutlined/>}
                    onClick={chooseMessageForReply}
                />
            </div>
            <div className="message__content">
                {message.replyToMessage && <MessageReply message={message.replyToMessage}/>}
                {isVoice && (files.length === 1) ?
                    <div className="message__audio-element-wrapper">
                        <AudioElement
                            blob={files[0].blob}
                            blobURL={files[0].blobUrl}
                            width={200}
                            height={35}
                        />
                    </div>
                    :
                    <Fragment>
                        <div className="message__attachment-wrapper">
                            {attachments}
                        </div>
                        {message.text &&
                            <Interweave
                                tagName="p"
                                className="message__text"
                                content={message.text}
                            />
                        }
                        <Modal
                            className="file-input__preview-wrapper"
                            title={previewFile?.originalName}
                            open={isPreviewOpen}
                            footer={null}
                            onCancel={handleCancel}
                        >
                            <img
                                className="file-input__preview"
                                alt="preview image"
                                style={{width: "100%"}}
                                src={previewFile?.blobUrl || ""}
                            />
                        </Modal>
                    </Fragment>
                }
            </div>
        </div>
    );
};

export default Message;