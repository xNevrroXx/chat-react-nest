import {MenuFoldOutlined, PhoneTwoTone} from "@ant-design/icons";
import {Typography, Avatar, Spin} from "antd";
import {type FC, useMemo} from "react";
// own modules
import type {IMessage, ISendMessage} from "../../models/IStore/IChats.ts";
import type {IUserDto} from "../../models/IStore/IAuthentication.ts";
import InputMessage from "../../components/InputMessage/InputMessage.tsx";
import Message from "../../components/Message/Message.tsx";
// styles
import "./active-chat.scss";
import {IActiveDialog} from "../../pages/Main/Main.tsx";
import {useAppDispatch} from "../../hooks/store.hook.ts";
import {sendMessageSocket} from "../../store/thunks/chat.ts";
import {TValueOf} from "../../models/TUtils.ts";

const {Title} = Typography;

interface IActiveChatProps {
    user: IUserDto
    dialog: IActiveDialog
}

const ChatContent: FC<IActiveChatProps> = ({user, dialog}) => {
    const dispatch = useAppDispatch();

    const onSendMessage = (text: TValueOf<Pick<ISendMessage, "text">>) => {
        console.log("SEND");
        const infoMessage: ISendMessage = {
            interlocutorId: dialog?.interlocutor.id,
            type: "TEXT",
            text: text
        };

      void dispatch(sendMessageSocket(infoMessage));
    };

    const listMessages = useMemo(() => {
        if (!dialog) {
            return null;
        }

        return dialog.chat.messages.map(({senderId, type, text, createdAt}) => {
            const isMeSender = user.id === senderId;

            console.log("type: ", type);
            return (
                <Message
                    key={createdAt.toString() + Math.random().toString()}
                    side={isMeSender ? "right" : "left"}
                    AUDIO={null}
                    VIDEO={null}
                    TEXT={type === "TEXT" ? text : null}
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
                <div className="active-chat__content">
                    {listMessages}
                </div>
                <div className="active-chat__footer">
                    <InputMessage
                        onSendMessage={onSendMessage}
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