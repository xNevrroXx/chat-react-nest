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
import {Modal} from "antd";
// own modules
import Message from "../../HOC/Message.tsx";
import {IUserDto} from "../../models/IStore/IAuthentication.ts";
import {IForwardedMessage, IForwardMessage, IMessage, IRoom} from "../../models/IStore/IRoom.ts";
import {TValueOf} from "../../models/TUtils.ts";
import {IFileForRender} from "../../models/IRoom.ts";
// styles
import "./room-content.scss";


interface IChatContentProps {
    className?: string,
    user: IUserDto;
    room: IRoom,
    isNeedScrollToLastMessage: RefObject<boolean>,
    onChooseMessageForPin: (message: IMessage | IForwardedMessage) => void,
    onChooseMessageForEdit: (message: IMessage) => void,
    onChooseMessageForReply: (message: IMessage | IForwardedMessage) => void,
    onChooseMessageForDelete: (message: IMessage | IForwardedMessage) => void,
    onOpenUsersListForForwardMessage: (forwardedMessageId: TValueOf<Pick<IForwardMessage, "forwardedMessageId">>) => void
}

const RoomContent = forwardRef<HTMLDivElement, IChatContentProps>(({
                                                                       className,
                                                                       user,
                                                                       room,
                                                                       onChooseMessageForPin,
                                                                       onChooseMessageForEdit,
                                                                       onChooseMessageForReply,
                                                                       onChooseMessageForDelete,
                                                                       isNeedScrollToLastMessage,
                                                                       onOpenUsersListForForwardMessage
                                                                   }, outerRef) => {
    const innerRef = useRef<HTMLDivElement | null>(null);
    const [previewFile, setPreviewFile] = useState<IFileForRender | null>(null);

    useImperativeHandle(outerRef, () => innerRef.current!, []);

    const handlePreview = useCallback((file: IFileForRender) => {
        setPreviewFile(file);
    }, []);

    const handleCancelPreview = useCallback(() => {
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
                    onChooseMessageForPin={onChooseMessageForPin}
                    onChooseMessageForEdit={onChooseMessageForEdit}
                    onChooseMessageForDelete={onChooseMessageForDelete}
                    onChooseMessageForReply={onChooseMessageForReply}
                    onOpenUsersListForForwardMessage={() => onOpenUsersListForForwardMessage(message.id)}
                />
            );
        });
    }, [room.messages, user.id, handlePreview, onChooseMessageForPin, onChooseMessageForEdit, onChooseMessageForDelete, onChooseMessageForReply, onOpenUsersListForForwardMessage]);

    useEffect(() => {
        if (!innerRef.current || !isNeedScrollToLastMessage.current) return;

        innerRef.current.scrollTo(0, innerRef.current.scrollHeight);
    }, [isNeedScrollToLastMessage, listMessages]);

    return (
        <div
            ref={innerRef}
            className={classNames("room-content", className)}
        >
            <div className="room-content__wrapper">
                {listMessages}
            </div>

            <Modal
                className="file-input__preview-wrapper"
                title={previewFile?.originalName}
                open={!!previewFile}
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

export default RoomContent;