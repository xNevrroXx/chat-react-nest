import React, {FC, useCallback, useEffect, useMemo, useState} from "react";
// own modules
import DumbMessage from "../../components/Message/DumbMessage.tsx";
// types
import {
    IFileForRender,
    TFileType,
    Message as MessageClass,
    ForwardedMessage as ForwardedMessageClass, IKnownAndUnknownFiles, TAttachmentType
} from "../../models/IStore/IChats.ts";
import {IUserDto} from "../../models/IStore/IAuthentication.ts";
import {TValueOf} from "../../models/TUtils.ts";

type TMessageProps = {
    userId: TValueOf<Pick<IUserDto, "id">>;
    chooseMessageForReply: (message: MessageClass | ForwardedMessageClass) => void;
    message: MessageClass | ForwardedMessageClass;
    onOpenUsersListForForwardMessage: () => void;
};

const Message: FC<TMessageProps> = ({userId, message, chooseMessageForReply, onOpenUsersListForForwardMessage}) => {
    const [isVoice, setIsVoice] = useState<boolean>(false);
    const [filesWithBlobUrls, setFilesWithBlobUrls] = useState<IKnownAndUnknownFiles>({
        known: [],
        unknown: []
    });
    const [isPreviewOpen, setIsPreviewOpen] = useState<boolean>(false);
    const [previewFile, setPreviewFile] = useState<IFileForRender | null>(null);

    useEffect(() => {
        if (message instanceof MessageClass) {
            if (!message.files || message.files.length === 0) {
                return;
            }

            if (message.files[0].fileType === TFileType[TFileType.VOICE_RECORD]) {
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
        chooseMessageForReply(message);
    }, [chooseMessageForReply, message]);

    const side = useMemo((): "right" | "left" => {
        return userId === message.senderId ? "right" : "left";
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
            side={side}
            isVoice={isVoice}
            files={filesWithBlobUrls}
            isPreviewOpen={isPreviewOpen}
            previewFile={previewFile}
            handlePreview={handlePreview}
            handleCancel={handleCancel}
            onChooseMessageForReply={onClickMessageForReply}
            onChooseMessageForForward={onOpenUsersListForForwardMessage}
            message={message}
        />
    );
};

export default Message;