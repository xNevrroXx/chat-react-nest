import React, {forwardRef, useEffect, useImperativeHandle, useMemo, useRef} from "react";
import * as classNames from "classnames";
// own modules
import Message from "../../HOC/Message.tsx";
import {IUserDto} from "../../models/IStore/IAuthentication.ts";
import {
    IForwardedMessage,
    IMessage,
    IRoom,
    TForwardMessage
} from "../../models/IStore/IChats.ts";
import {TValueOf} from "../../models/TUtils.ts";
// styles
import "./chat-content.scss";


interface IChatContentProps {
    className?: string,
    user: IUserDto;
    room: IRoom,
    isNeedScrollToLastMessage: boolean,
    onChooseMessageForEdit: (message: IMessage) => void,
    onChooseMessageForReply: (message: IMessage | IForwardedMessage) => void,
    onOpenUsersListForForwardMessage: (forwardedMessageId: TValueOf<Pick<TForwardMessage, "forwardedMessageId">>) => void
}

const ChatContent = forwardRef<HTMLDivElement, IChatContentProps>(({
                                                                       className,
                                                                       user,
                                                                       room,
                                                                       onChooseMessageForEdit,
                                                                       onChooseMessageForReply,
                                                                       isNeedScrollToLastMessage,
                                                                       onOpenUsersListForForwardMessage
                                                                   }, outerRef) => {
    const innerRef = useRef<HTMLDivElement | null>(null);

    useImperativeHandle(outerRef, () => innerRef.current!, []);

    const listMessages = useMemo(() => {
        if (!room) {
            return null;
        }

        return room.messages.map(message => {
            return (
                <Message
                    key={message.id}
                    userId={user.id}
                    message={message}
                    onChooseMessageForEdit={onChooseMessageForEdit}
                    onChooseMessageForReply={onChooseMessageForReply}
                    onOpenUsersListForForwardMessage={() => onOpenUsersListForForwardMessage(message.id)}
                />
            );
        });
    }, [room, user.id, onChooseMessageForEdit, onChooseMessageForReply, onOpenUsersListForForwardMessage]);

    useEffect(() => {
        if (!innerRef.current || !isNeedScrollToLastMessage) return;

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
        </div>
    );
});

export default ChatContent;