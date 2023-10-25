import {MenuFoldOutlined, PhoneTwoTone} from "@ant-design/icons";
import {Avatar, Spin, Typography} from "antd";
import React, {type FC, Fragment, useMemo, useRef, useState} from "react";
// own modules
import {useScrollTrigger} from "../../hooks/useScrollTrigger.hook.ts";
import ChatContent from "../../components/ChatContent/ChatContent.tsx";
import InputMessage from "../InputMessage/InputMessage.tsx";
import ScrollDownButton from "../../components/ScrollDownButton/ScrollDownButton.tsx";
import type {IUserDto} from "../../models/IStore/IAuthentication.ts";
import type {TValueOf} from "../../models/TUtils.ts";
import {
    TForwardMessage,
    TSendMessage,
    IAttachment,
    IRoom,
    FileType,
    ForwardedMessage as ForwardedMessageClass,
    Message as MessageClass,
    RoomType
} from "../../models/IStore/IChats.ts";
// actions
import {useAppDispatch} from "../../hooks/store.hook.ts";
import {sendMessageSocket, toggleUserTypingSocket} from "../../store/thunks/chat.ts";
// styles
import "./active-room.scss";

const {Title} = Typography;

interface IActiveChatProps {
    user: IUserDto;
    room: IRoom
    onOpenUsersListForForwardMessage: (forwardedMessageId: TValueOf<Pick<TForwardMessage, "forwardedMessageId">>) => void;
}

const ActiveRoom: FC<IActiveChatProps> = ({user, room, onOpenUsersListForForwardMessage}) => {
    const dispatch = useAppDispatch();
    const [messageForReply, setMessageForReply] = useState<MessageClass | ForwardedMessageClass | null>(null);
    const [isVisibleScrollButton, setIsVisibleScrollButton] = useState<boolean>(true);
    const typingTimoutRef = useRef<number | null>(null);
    const refChatContent = useScrollTrigger({
        onIntersectionBreakpoint: {
            toTop: () => setIsVisibleScrollButton(true),
            toBottom: () => setIsVisibleScrollButton(false)
        },
        breakpointPx: 350
    });

    const onClickScrollButton = () => {
        if (!refChatContent.current) return;

        refChatContent.current.scrollTo(0, refChatContent.current?.scrollHeight);
    };

    const onChooseMessageForReply = (message: MessageClass | ForwardedMessageClass) => {
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

    const userStatuses = useMemo(() => {
        if (!room.participants || room.participants.length === 0) {
            return;
        }

        switch (room.roomType) {
            case RoomType.PRIVATE:
                if (room.participants[0].isOnline) {
                    if (room.participants[0].isTyping) {
                        return "Печатает...";
                    }
                    return "В сети";
                }
                return "Не в сети";
            case RoomType.GROUP:
                return room.participants.map(participant => participant.nickname + "печатает...");
        }
    }, [room]);

    const content = (): JSX.Element => {
        if (!room) {
            return <Spin/>;
        }

        return (
            <Fragment>
                <div className="active-room__header">
                    <div className="active-room__info">
                        <Avatar size={36} className="active-room__photo">{/*photo*/}</Avatar>
                        <div className="active-room__wrapper">
                            <Title
                                level={5}
                                className="active-room__name"
                            >
                                {room.name}
                            </Title>
                            <p className="active-room__status">{userStatuses}</p>
                        </div>
                    </div>
                    <div className="active-room__space"></div>
                    <div className="active-room__options">
                        <PhoneTwoTone/>
                        <MenuFoldOutlined/>
                    </div>
                </div>

                <ChatContent
                    ref={refChatContent}
                    user={user}
                    room={room}
                    onChooseMessageForReply={onChooseMessageForReply}
                    onOpenUsersListForForwardMessage={onOpenUsersListForForwardMessage}
                />

                <div className="active-room__footer">
                    {isVisibleScrollButton &&
                        <ScrollDownButton
                            onClick={onClickScrollButton}
                            amountUnreadMessages={0}
                        />
                    }
                    <InputMessage
                        messageForReply={messageForReply}
                        removeMessageForReply={removeMessageForReply}
                        onTyping={onTyping}
                        onSendMessage={onSendMessage}
                        sendVoiceMessage={sendVoiceMessage}
                    />
                </div>
            </Fragment>
        );
    };

    return (
        <div className="active-room">
            {content()}
        </div>
    );
};

export default ActiveRoom;