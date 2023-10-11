import React, {FC, useCallback, useEffect, useState} from "react";
// own modules
import {default as DumbMessage} from "../../components/Message/Message.tsx";
// types
import {IMessage, IFileForRender, TFileType} from "../../models/IStore/IChats.ts";

type TMessageProps = {
    side: "left" | "right"
} & Omit<IMessage, "id" | "recipientId" | "senderId">

const Message: FC<TMessageProps> = ({side, text, files}) => {
    const [isVoice, setIsVoice] = useState<boolean>(false);
    const [filesWithBlobUrls, setFilesWithBlobUrls] = useState<IFileForRender[]>([]);
    const [isPreviewOpen, setIsPreviewOpen] = useState<boolean>(false);
    const [previewFile, setPreviewFile] = useState<IFileForRender | null>(null);

    useEffect(() => {
        if (!files || files.length === 0) {
            return;
        }

        if (files.at(0)!.fileType === TFileType[TFileType.VOICE_RECORD]) {
            const blob = files.at(0)!.blob;
            const blobUrl = URL.createObjectURL(blob);
            const voiceInfo = {
                ...files[0],
                blobUrl
            };
            setFilesWithBlobUrls([voiceInfo]);
            setIsVoice(true);
        }
        else {
            const filesWithBlobUrl: IFileForRender[] = [];
            files.forEach(file => {
                const blobUrl = URL.createObjectURL(file.blob);
                filesWithBlobUrl.push({
                    ...file,
                    blobUrl
                });
            });
            setFilesWithBlobUrls(filesWithBlobUrl);
        }
    }, [files]);

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
            text={text}
            isVoice={isVoice}
            files={filesWithBlobUrls}
            isPreviewOpen={isPreviewOpen}
            previewFile={previewFile}
            handlePreview={handlePreview}
            handleCancel={handleCancel}
        />
    );
};

export default Message;