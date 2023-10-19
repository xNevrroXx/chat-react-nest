import {MenuFoldOutlined, PhoneTwoTone} from "@ant-design/icons";
import {Typography, Avatar, Spin} from "antd";
import {type FC, useMemo, useRef, useState} from "react";
// own modules
import Message from "../../HOC/Message/Message.tsx";
import InputMessage from "../InputMessage/InputMessage.tsx";
import type {IUserDto} from "../../models/IStore/IAuthentication.ts";
import type {TValueOf} from "../../models/TUtils.ts";
import {
    TSendMessage,
    IAttachment,
    TForwardMessage,
    IRoom,
    FileType,
    Message as MessageClass,
    ForwardedMessage as ForwardedMessageClass
} from "../../models/IStore/IChats.ts";
// actions
import {useAppDispatch} from "../../hooks/store.hook.ts";
import {sendMessageSocket, toggleUserTypingSocket} from "../../store/thunks/chat.ts";
// styles
import "./chat-content.scss";

const {Title} = Typography;

interface IActiveChatProps {
    user: IUserDto;
    room: IRoom;
    onOpenUsersListForForwardMessage: (forwardedMessageId: TValueOf<Pick<TForwardMessage, "forwardedMessageId">>) => void;
}

const ChatContent: FC<IActiveChatProps> = ({user, room, onOpenUsersListForForwardMessage}) => {
    const dispatch = useAppDispatch();
    const typingTimoutRef = useRef<number | null>(null);
    const [messageForReply, setMessageForReply] = useState<MessageClass | ForwardedMessageClass | null>(null);

    const chooseMessageForReply = (message: MessageClass | ForwardedMessageClass) => {
        setMessageForReply(message);
    };
    const removeMessageForReply = () => {
        setMessageForReply(null);
    };

    const onTyping = () => {
        if (typingTimoutRef.current) {
            // if the user has recently typed
            clearTimeout(typingTimoutRef.current);

            typingTimoutRef.current = setTimeout(() => {
                void dispatch(
                    toggleUserTypingSocket({
                        roomId: room.id,
                        isTyping: false
                    })
                );
                typingTimoutRef.current = null;
            }, 4000);

            return;
        }

        void dispatch(
            toggleUserTypingSocket({
                roomId: room.id,
                isTyping: true
            })
        );

        typingTimoutRef.current = setTimeout(() => {
            void dispatch(
                toggleUserTypingSocket({
                    roomId: room.id,
                    isTyping: false
                })
            );
        }, 4000);
    };

    const onSendMessage = (text: TValueOf<Pick<TSendMessage, "text">>, attachments: IAttachment[]) => {
        const message: TSendMessage = {
            roomId: room.id,
            text,
            attachments,
            replyToMessageId: messageForReply && messageForReply.id
        };

        if (typingTimoutRef.current) {
            clearTimeout(typingTimoutRef.current);
            typingTimoutRef.current = null;
        }
        removeMessageForReply();
        void dispatch(sendMessageSocket(message));
    };

    const sendVoiceMessage = async (record: Blob) => {
        const buffer = await record.arrayBuffer();
        const attachment: IAttachment = {
            originalName: "",
            fileType: FileType.VOICE_RECORD,
            mimeType: "audio/webm",
            extension: "webm",
            buffer: buffer
        };

        onSendMessage(null, [attachment]);
    };

    // const onForwardMessage = (messageId:)

    const isOnlineOrTyping = useMemo(() => {
        if (room.usersTyping.some(typingInfo => typingInfo.isTyping)) {
            return "Печатает...";
        }

        return "НАВЕРНОЕ Не в сети";
        // return room.userOnline?.isOnline ? "В сети" : "Не в сети";
    }, [room]);

    const listMessages = useMemo(() => {
        console.log("dialog: ", room);
        if (!room) {
            return null;
        }

        return room.messages.map(message => {
            return (
                <Message
                    key={message.id}
                    userId={user.id}
                    chooseMessageForReply={chooseMessageForReply}
                    message={message}
                    onOpenUsersListForForwardMessage={() => onOpenUsersListForForwardMessage(message.id)}
                />
            );
        });
    }, [user, room]);

    const content = (): JSX.Element => {
        if (!room) {
            return <Spin/>;
        }

        return (
            <>
                <div className="active-chat__header">
                    <div className="active-chat__info">
                        <Avatar size={36} className="active-chat__photo">{/*photo*/}</Avatar>
                        <div className="active-chat__wrapper">
                            <Title
                                level={5}
                                className="active-chat__name"
                            >
                                {room.name || "NOT FOUND NAME"}
                            </Title>
                            <p className="active-chat__status">{isOnlineOrTyping}</p>
                        </div>
                    </div>
                    <div className="active-chat__space"></div>
                    <div className="active-chat__options">
                        <PhoneTwoTone/>
                        <MenuFoldOutlined/>
                    </div>
                </div>
                <div className="active-chat__content-wrapper">
                    <div className="active-chat__content">
                        {listMessages}
                    </div>
                </div>
                <div className="active-chat__footer">
                    <InputMessage
                        messageForReply={messageForReply}
                        removeMessageForReply={removeMessageForReply}
                        onTyping={onTyping}
                        onSendMessage={onSendMessage}
                        sendVoiceMessage={sendVoiceMessage}
                    />
                </div>
            </>
        );
    };

    return (
        <div className="active-chat">
            {content()}
        </div>
    );
};

export default ChatContent;