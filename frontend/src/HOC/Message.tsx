import React, {FC, useCallback, useEffect, useMemo, useState} from "react";
// own modules
import DumbMessage from "../components/Message/Message.tsx";
// types
import {
    FileType,
    checkIsMessage,
    IMessage,
    IForwardedMessage
} from "../models/IStore/IRoom.ts";
import {IUserDto} from "../models/IStore/IAuthentication.ts";
import {TValueOf} from "../models/TUtils.ts";
import {IFileForRender, IKnownAndUnknownFiles, TAttachmentType} from "../models/IRoom.ts";

type TMessageProps = {
    userId: TValueOf<Pick<IUserDto, "id">>;
    message: IMessage | IForwardedMessage;
    onOpenUsersListForForwardMessage: () => void;
    onChooseMessageForPin: (message: IMessage | IForwardedMessage) => void;
    onChooseMessageForEdit: (message: IMessage) => void;
    onChooseMessageForDelete: (message: IMessage | IForwardedMessage) => void;
    onChooseMessageForReply: (message: IMessage | IForwardedMessage) => void;
    handlePreview: (file: IFileForRender) => void;
};

const Message: FC<TMessageProps> = ({
                                        userId,
                                        message,
                                        onChooseMessageForPin,
                                        onChooseMessageForEdit,
                                        onChooseMessageForReply,
                                        onChooseMessageForDelete,
                                        onOpenUsersListForForwardMessage,
                                        handlePreview
                                    }) => {
    const [isVoice, setIsVoice] = useState<boolean>(false);
    const [filesWithBlobUrls, setFilesWithBlobUrls] = useState<IKnownAndUnknownFiles>({
        known: [],
        unknown: []
    });

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
            } else {
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

    const onClickMessageForPin = useCallback(() => {
        onChooseMessageForPin(message);
    }, [onChooseMessageForPin, message]);

    const onClickMessageForReply = useCallback(() => {
        onChooseMessageForReply(message);
    }, [onChooseMessageForReply, message]);

    const onClickMessageForEdit = useCallback(() => {
        if (!checkIsMessage(message)) return;

        onChooseMessageForEdit(message);
    }, [onChooseMessageForEdit, message]);

    const onClickMessageForDelete = useCallback(() => {
        onChooseMessageForDelete(message);
    }, [onChooseMessageForDelete, message]);

    const isMine = useMemo((): boolean => {
        return userId === message.senderId;
    }, [message.senderId, userId]);

    return (
        <DumbMessage
            isMine={isMine}
            isVoice={isVoice}
            files={filesWithBlobUrls}
            handlePreview={handlePreview}
            onChooseMessageForPin={onClickMessageForPin}
            onChooseMessageForEdit={onClickMessageForEdit}
            onChooseMessageForDelete={onClickMessageForDelete}
            onChooseMessageForReply={onClickMessageForReply}
            onChooseMessageForForward={onOpenUsersListForForwardMessage}
            message={message}
        />
    );
};

export default Message;