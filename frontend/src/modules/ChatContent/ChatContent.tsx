import {MenuFoldOutlined, PhoneTwoTone} from "@ant-design/icons";
import {Typography, Avatar, Spin} from "antd";
import {type FC, useMemo, useRef, useState} from "react";
// own modules
import InputMessage from "../InputMessage/InputMessage.tsx";
import Message from "../../HOC/Message/Message.tsx";
import type {IMessage, TSendMessage} from "../../models/IStore/IChats.ts";
import type {IUserDto} from "../../models/IStore/IAuthentication.ts";
import type {IActiveDialog} from "../../pages/Main/Main.tsx";
import type {TValueOf} from "../../models/TUtils.ts";
import {type IAttachment, TFileType} from "../../models/IStore/IChats.ts";
// actions
import {useAppDispatch} from "../../hooks/store.hook.ts";
import {sendMessageSocket, toggleUserTypingSocket} from "../../store/thunks/chat.ts";
// styles
import "./chat-content.scss";

const {Title} = Typography;

interface IActiveChatProps {
    user: IUserDto
    dialog: IActiveDialog
}

const ChatContent: FC<IActiveChatProps> = ({user, dialog}) => {
    const dispatch = useAppDispatch();
    const typingTimoutRef = useRef<number | null>(null);
    const [messageForReply, setMessageForReply] = useState<IMessage | null>(null);

    const chooseMessageForReply = (message: IMessage) => {
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
                        userTargetId: dialog.interlocutor.id,
                        isTyping: false
                    })
                );
                typingTimoutRef.current = null;
            }, 4000);

            return;
        }

        void dispatch(
            toggleUserTypingSocket({
                userTargetId: dialog.interlocutor.id,
                isTyping: true
            })
        );

        typingTimoutRef.current = setTimeout(() => {
            void dispatch(
                toggleUserTypingSocket({
                    userTargetId: dialog.interlocutor.id,
                    isTyping: false
                })
            );
        }, 4000);
    };

    const onSendMessage = (text: TValueOf<Pick<TSendMessage, "text">>, attachments: IAttachment[]) => {
        const message: TSendMessage = {
            interlocutorId: dialog?.interlocutor.id,
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
            fileType: TFileType.VOICE_RECORD,
            mimeType: "audio/webm",
            extension: "webm",
            buffer: buffer
        };

        onSendMessage(null, [attachment]);
    };

    const isOnlineOrTyping = useMemo(() => {
        if (dialog.chat.isTyping) {
            return "Печатает...";
        }

        return dialog.interlocutor.userOnline?.isOnline ? "В сети" : "Не в сети";
    }, [dialog]);

    const listMessages = useMemo(() => {
        if (!dialog) {
            return null;
        }

        return dialog.chat.messages.map(message => {
            return (
                <Message
                    key={message.id}
                    userId={user.id}
                    chooseMessageForReply={chooseMessageForReply}
                    message={message}
                />
            );
        });
    }, [user, dialog]);

    const content = (): JSX.Element => {
        if (!dialog) {
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
                                {dialog.interlocutor.name.concat(" ", dialog.interlocutor.surname)}
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