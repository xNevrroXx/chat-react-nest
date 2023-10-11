import {MenuFoldOutlined, PhoneTwoTone} from "@ant-design/icons";
import {Typography, Avatar, Spin} from "antd";
import {type FC, useMemo} from "react";
// own modules
import InputMessage from "../InputMessage/InputMessage.tsx";
import Message from "../../HOC/Message/Message.tsx";
import type {TSendMessage} from "../../models/IStore/IChats.ts";
import type {IUserDto} from "../../models/IStore/IAuthentication.ts";
import type {IActiveDialog} from "../../pages/Main/Main.tsx";
import type {TValueOf} from "../../models/TUtils.ts";
// actions
import {useAppDispatch} from "../../hooks/store.hook.ts";
import {sendMessageSocket} from "../../store/thunks/chat.ts";
// styles
import "./chat-content.scss";
import {IAttachment, TFileType} from "../../models/IStore/IChats.ts";

const {Title} = Typography;

interface IActiveChatProps {
    user: IUserDto
    dialog: IActiveDialog
}

const ChatContent: FC<IActiveChatProps> = ({user, dialog}) => {
    const dispatch = useAppDispatch();

    const onSendMessage = (text: TValueOf<Pick<TSendMessage, "text">>, attachments: IAttachment[]) => {
        const message: TSendMessage = {
            interlocutorId: dialog?.interlocutor.id,
            text: text,
            attachments: attachments
        };

      void dispatch(sendMessageSocket(message));
    };

    const sendVoiceMessage = async (record: Blob) => {
        const buffer = await record.arrayBuffer();
        const attachment: IAttachment = {
            originalName: "",
            fileType: TFileType[TFileType.VOICE_RECORD],
            mimeType: "audio/webm",
            extension: "webm",
            buffer: buffer
        };

        onSendMessage(null, [attachment]);
    };

    const listMessages = useMemo(() => {
        if (!dialog) {
            return null;
        }

        return dialog.chat.messages.map(({id, senderId, text, createdAt, hasRead, updatedAt, files}) => {
            const isMeSender = user.id === senderId;
            return (
                <Message
                    key={id}
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