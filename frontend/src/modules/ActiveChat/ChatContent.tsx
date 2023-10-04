import {MenuFoldOutlined, PhoneTwoTone} from "@ant-design/icons";
import {Typography, Avatar, Spin} from "antd";
import {type FC, useMemo} from "react";
// own modules
import InputMessage from "../../components/InputMessage/InputMessage.tsx";
import Message from "../../components/Message/Message.tsx";
import type {ISendMessage} from "../../models/IStore/IChats.ts";
import type {IUserDto} from "../../models/IStore/IAuthentication.ts";
import type {IActiveDialog} from "../../pages/Main/Main.tsx";
import type {TValueOf} from "../../models/TUtils.ts";
// actions
import {useAppDispatch} from "../../hooks/store.hook.ts";
import {sendMessageSocket, sendVoiceMessageSocket} from "../../store/thunks/chat.ts";
// styles
import "./active-chat.scss";
import {ISendVoiceMessage} from "../../models/IStore/IChats.ts";

const {Title} = Typography;

interface IActiveChatProps {
    user: IUserDto
    dialog: IActiveDialog
}

const ChatContent: FC<IActiveChatProps> = ({user, dialog}) => {
    const dispatch = useAppDispatch();

    const onSendMessage = (text: TValueOf<Pick<ISendMessage, "text">>) => {
        const message: ISendMessage = {
            interlocutorId: dialog?.interlocutor.id,
            text: text
        };

      void dispatch(sendMessageSocket(message));
    };

    const sendVoiceMessage = (record: Blob) => {
        const message: ISendVoiceMessage = {
            interlocutorId: dialog?.interlocutor.id,
            blob: record
        };

        void dispatch(sendVoiceMessageSocket(message));
    };

    const listMessages = useMemo(() => {
        if (!dialog) {
            return null;
        }

        return dialog.chat.messages.map(({senderId, text, createdAt, hasRead, updatedAt, files}) => {
            const isMeSender = user.id === senderId;

            return (
                <Message
                    key={createdAt.toString() + Math.random().toString()}
                    side={isMeSender ? "right" : "left"}
                    hasRead={hasRead}
                    text={text}
                    files={files}

                    createdAt={createdAt}
                    updatedAt={updatedAt}
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
                            <Title level={5} className="active-chat__name">{dialog.interlocutor.name.concat(" ", dialog.interlocutor.surname)}</Title>
                            <p className="active-chat__status">В сети</p>
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