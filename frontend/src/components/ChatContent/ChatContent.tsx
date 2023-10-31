import React, {
    forwardRef,
    RefObject,
    useCallback,
    useEffect,
    useImperativeHandle,
    useMemo,
    useRef,
    useState
} from "react";
import * as classNames from "classnames";
// own modules
import Message from "../../HOC/Message.tsx";
import {IUserDto} from "../../models/IStore/IAuthentication.ts";
import {IForwardedMessage, IForwardMessage, IMessage, IRoom} from "../../models/IStore/IChats.ts";
import {TValueOf} from "../../models/TUtils.ts";
// styles
import "./chat-content.scss";
import {IFileForRender} from "../../models/IChat.ts";
import {Modal} from "antd";


interface IChatContentProps {
    className?: string,
    user: IUserDto;
    room: IRoom,
    isNeedScrollToLastMessage: RefObject<boolean>,
    onChooseMessageForEdit: (message: IMessage) => void,
    onChooseMessageForReply: (message: IMessage | IForwardedMessage) => void,
    onChooseMessageForDelete: (message: IMessage | IForwardedMessage) => void,
    onOpenUsersListForForwardMessage: (forwardedMessageId: TValueOf<Pick<IForwardMessage, "forwardedMessageId">>) => void
}

const ChatContent = forwardRef<HTMLDivElement, IChatContentProps>(({
                                                                       className,
                                                                       user,
                                                                       room,
                                                                       onChooseMessageForEdit,
                                                                       onChooseMessageForReply,
                                                                       onChooseMessageForDelete,
                                                                       isNeedScrollToLastMessage,
                                                                       onOpenUsersListForForwardMessage
                                                                   }, outerRef) => {
    const innerRef = useRef<HTMLDivElement | null>(null);
    const [isPreviewOpen, setIsPreviewOpen] = useState<boolean>(false);
    const [previewFile, setPreviewFile] = useState<IFileForRender | null>(null);

    useImperativeHandle(outerRef, () => innerRef.current!, []);

    const handlePreview = useCallback((file: IFileForRender) => {
        setPreviewFile(file);
        setIsPreviewOpen(true);
    }, []);

    const handleCancelPreview = useCallback(() => {
        setIsPreviewOpen(false);
        setPreviewFile(null);
    }, []);

    const listMessages = useMemo(() => {
        if (!room.messages) {
            return null;
        }

        return room.messages.map(message => {
            if (message.isDeleted) return;
            return (
                <Message
                    key={message.id}
                    userId={user.id}
                    message={message}
                    handlePreview={handlePreview}
                    onChooseMessageForEdit={onChooseMessageForEdit}
                    onChooseMessageForDelete={onChooseMessageForDelete}
                    onChooseMessageForReply={onChooseMessageForReply}
                    onOpenUsersListForForwardMessage={() => onOpenUsersListForForwardMessage(message.id)}
                />
            );
        });
    }, [room.messages, user.id, handlePreview, onChooseMessageForEdit, onChooseMessageForDelete, onChooseMessageForReply, onOpenUsersListForForwardMessage]);

    useEffect(() => {
        if (!innerRef.current || !isNeedScrollToLastMessage.current) return;

        innerRef.current.scrollTo(0, innerRef.current.scrollHeight);
    }, [isNeedScrollToLastMessage, listMessages]);

    return (
        <div
            ref={innerRef}
            className={classNames("chat-content", className)}
        >
            <div className="chat-content__wrapper">
                {listMessages}
            </div>

            <Modal
                className="file-input__preview-wrapper"
                title={previewFile?.originalName}
                open={isPreviewOpen}
                footer={null}
                onCancel={handleCancelPreview}
            >
                <img
                    className="file-input__preview"
                    alt="preview image"
                    style={{width: "100%"}}
                    src={previewFile?.blobUrl || ""}
                />
            </Modal>
        </div>
    );
});

export default ChatContent;