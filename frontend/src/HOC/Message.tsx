import React, {FC, useCallback, useEffect, useMemo, useState} from "react";
// own modules
import DumbMessage from "../components/Message/DumbMessage.tsx";
// types
import {
    checkIsMessage,
    FileType, IForwardedMessage, IMessage
} from "../models/IStore/IChats.ts";
import {IUserDto} from "../models/IStore/IAuthentication.ts";
import {TValueOf} from "../models/TUtils.ts";
import {IFileForRender, IKnownAndUnknownFiles, TAttachmentType} from "../models/IChat.ts";

type TMessageProps = {
    userId: TValueOf<Pick<IUserDto, "id">>;
    message: IMessage | IForwardedMessage;
    onOpenUsersListForForwardMessage: () => void;
    onChooseMessageForEdit: (message: IMessage) => void,
    onChooseMessageForReply: (message: IMessage | IForwardedMessage) => void;
};

const Message: FC<TMessageProps> = ({
                                        userId,
                                        message,
                                        onChooseMessageForEdit,
                                        onChooseMessageForReply,
                                        onOpenUsersListForForwardMessage
}) => {
    const [isVoice, setIsVoice] = useState<boolean>(false);
    const [filesWithBlobUrls, setFilesWithBlobUrls] = useState<IKnownAndUnknownFiles>({
        known: [],
        unknown: []
    });
    const [isPreviewOpen, setIsPreviewOpen] = useState<boolean>(false);
    const [previewFile, setPreviewFile] = useState<IFileForRender | null>(null);

    useEffect(() => {
        if (checkIsMessage(message)) {
            if (!message.files || message.files.length === 0) {
                return;
            }

            if (message.files[0].fileType === FileType[FileType.VOICE_RECORD]) {
                const blob = message.files[0].blob;
                const blobUrl = URL.createObjectURL(blob);
                const voiceInfo = {
                    ...message.files[0],
                    blobUrl
                };
                setFilesWithBlobUrls({
                    known: [{
                        ...voiceInfo,
                        attachmentType: "audio"
                    }],
                    unknown: []
                });
                setIsVoice(true);
            }
            else {
                const filesWithBlobUrl = message.files.reduce<IKnownAndUnknownFiles>((previousValue, file) => {
                    let attachmentType: TAttachmentType;
                    if (file.mimeType.includes("video")) {
                        attachmentType = "video";
                    } else if (file.mimeType.includes("image")) {
                        attachmentType = "image";
                    } else if (file.mimeType.includes("audio")) {
                        attachmentType = "audio";
                    } else {
                        attachmentType = "unknown";
                    }
                    const blobUrl = URL.createObjectURL(file.blob);

                    attachmentType !== "unknown"
                        ? previousValue.known.push({
                            ...file,
                            blobUrl,
                            attachmentType
                        })
                        : previousValue.unknown.push({
                            ...file,
                            blobUrl,
                            attachmentType
                        });
                    return previousValue;
                }, {
                    known: [],
                    unknown: []
                });

                setFilesWithBlobUrls(filesWithBlobUrl);
            }
        }
    }, [message]);

    const onClickMessageForReply = useCallback(() => {
        onChooseMessageForReply(message);
    }, [onChooseMessageForReply, message]);

    const onClickMessageForEdit = useCallback(() => {
        if ( !checkIsMessage(message) ) return;

        onChooseMessageForEdit(message);
    }, [onChooseMessageForEdit, message]);

    const isMine = useMemo((): boolean => {
        return userId === message.senderId;
    }, [message.senderId, userId]);

    const handlePreview = useCallback((file: IFileForRender) => {
        setPreviewFile(file);
        setIsPreviewOpen(true);
    }, []);

    const handleCancel = useCallback(() => {
        setIsPreviewOpen(false);
        setPreviewFile(null);
    }, []);

    return (
        <DumbMessage
            isMine={isMine}
            isVoice={isVoice}
            files={filesWithBlobUrls}
            isPreviewOpen={isPreviewOpen}
            previewFile={previewFile}
            handlePreview={handlePreview}
            handleCancel={handleCancel}
            onClickMessageForEdit={onClickMessageForEdit}
            onChooseMessageForReply={onClickMessageForReply}
            onChooseMessageForForward={onOpenUsersListForForwardMessage}
            message={message}
        />
    );
};

export default Message;