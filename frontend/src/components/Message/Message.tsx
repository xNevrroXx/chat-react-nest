import React, {FC, Fragment, useCallback, useMemo, useRef, useState} from "react";
import * as classNames from "classnames";
import {Modal} from "antd";
import {FileTwoTone} from "@ant-design/icons";
// own modules
import AudioElement from "../AudioElement/AudioElement.tsx";
// types
import {IFileForRender} from "../../models/IStore/IChats.ts";
// styles
import "./message.scss";

interface IMessageProps {
    side: "left" | "right",
    isVoice: boolean;
    files: IFileForRender[];
    isPreviewOpen: boolean;
    previewFile: IFileForRender | null;
    handlePreview: (file: IFileForRender) => void;
    handleCancel: () => void;
    text: string | null
}

const Message: FC<IMessageProps> = ({
                                        side,
                                        text,
                                        isVoice,
                                        files,
                                        isPreviewOpen,
                                        previewFile,
                                        handlePreview,
                                        handleCancel,
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
                <FileTwoTone />
                <span className="message__attachment-file-name">{fileInfo.originalName}</span>
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
            }
            else if (fileInfo.mimeType.includes("image")) {
                fileType = "image";
                fileElem = imageElem(fileInfo);
            }
            else if (fileInfo.mimeType.includes("audio")) {
                fileType = "audio";
                // fileElem = imageElem(fileInfo); // todo add audio element
            }
            else {
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
            className={
                classNames("message", "message__" + side)
            }
        >
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
                        <a ref={downloadLinkRef}/>
                    </div>
                    {text &&
                        <p
                            className="message__text"
                            dangerouslySetInnerHTML={{__html: text}}
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
    );
};

export default Message;