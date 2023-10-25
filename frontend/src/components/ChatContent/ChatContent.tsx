import React, {forwardRef, useMemo} from "react";
import * as classNames from "classnames";
// own modules
import Message from "../../HOC/Message.tsx";
import {IUserDto} from "../../models/IStore/IAuthentication.ts";
import {
    IRoom,
    TForwardMessage,
    ForwardedMessage as ForwardedMessageClass,
    Message as MessageClass
} from "../../models/IStore/IChats.ts";
import {TValueOf} from "../../models/TUtils.ts";
// styles
import "./chat-content.scss";


interface IChatContentProps {
    className?: string,
    user: IUserDto;
    room: IRoom
    onChooseMessageForReply: (message: MessageClass | ForwardedMessageClass) => void,
    onOpenUsersListForForwardMessage: (forwardedMessageId: TValueOf<Pick<TForwardMessage, "forwardedMessageId">>) => void;
}

const ChatContent = forwardRef<HTMLDivElement, IChatContentProps>(({
                                                           className,
                                                           user,
                                                           room,
                                                           onChooseMessageForReply,
                                                           onOpenUsersListForForwardMessage
                                                       }, ref) => {

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
                    onChooseMessageForReply={onChooseMessageForReply}
                    onOpenUsersListForForwardMessage={() => onOpenUsersListForForwardMessage(message.id)}
                />
            );
        });
    }, [room, user, onChooseMessageForReply, onOpenUsersListForForwardMessage]);

    return (
        <div
            ref={ref}
            className={classNames("chat-content", className)}
        >
            <div className="chat-content__wrapper">
                {listMessages}
            </div>
        </div>
    );
})

export default ChatContent;