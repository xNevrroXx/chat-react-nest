import {MenuFoldOutlined, PhoneTwoTone} from "@ant-design/icons";
import {Avatar, Checkbox, Modal, Spin, Typography} from "antd";
import React, {type FC, Fragment, useCallback, useMemo, useRef, useState} from "react";
// own modules
import {useScrollTrigger} from "../../hooks/useScrollTrigger.hook.ts";
import ChatContent from "../../components/ChatContent/ChatContent.tsx";
import InputMessage from "../InputMessage/InputMessage.tsx";
import ScrollDownButton from "../../components/ScrollDownButton/ScrollDownButton.tsx";
import type {IUserDto} from "../../models/IStore/IAuthentication.ts";
import type {TValueOf} from "../../models/TUtils.ts";
import {
    FileType,
    IAttachment,
    IEditMessage,
    IForwardedMessage,
    IForwardMessage,
    IMessage,
    IRoom,
    RoomType,
    TSendMessage
} from "../../models/IStore/IChats.ts";
// actions
import {useAppDispatch, useAppSelector} from "../../hooks/store.hook.ts";
import {
    deleteMessageSocket,
    editMessageSocket,
    sendMessageSocket,
    toggleUserTypingSocket
} from "../../store/thunks/chat.ts";
// styles
import "./active-room.scss";
import {truncateTheText} from "../../utils/truncateTheText.ts";

const {Text, Title} = Typography;

interface IActiveChatProps {
    user: IUserDto;
    room: IRoom
    onOpenUsersListForForwardMessage: (forwardedMessageId: TValueOf<Pick<IForwardMessage, "forwardedMessageId">>) => void;
}

const ActiveRoom: FC<IActiveChatProps> = ({user, room, onOpenUsersListForForwardMessage}) => {
    const dispatch = useAppDispatch();
    const interlocutor = useAppSelector(state => {
        if (room.roomType === RoomType.GROUP) return;
        return state.users.users.find(user => user.id === room.participants[0].userId);
    });
    const [messageForEdit, setMessageForEdit] = useState<IMessage | null>(null);
    const [messageForReply, setMessageForReply] = useState<IMessage | IForwardedMessage | null>(null);
    const [messageForDelete, setMessageForDelete] = useState<{
        message: IMessage | IForwardedMessage,
        isForEveryone: boolean
    } | null>(null);
    const [isVisibleScrollButtonState, setIsVisibleScrollButtonState] = useState<boolean>(true);
    const isNeedScrollToLastMessage = useRef<boolean>(true);
    const typingTimoutRef = useRef<number | null>(null);
    const refChatContent = useScrollTrigger({
        onIntersectionBreakpoint: {
            toTop: () => {
                setIsVisibleScrollButtonState(true);
                isNeedScrollToLastMessage.current = false;
            },
            toBottom: () => {
                setIsVisibleScrollButtonState(false);
                isNeedScrollToLastMessage.current = true;
            },
        },
        breakpointPx: 350
    });

    const onClickScrollButton = () => {
        if (!refChatContent.current) return;

        refChatContent.current.scrollTo(0, refChatContent.current?.scrollHeight);
    };

    const onChooseMessageForReply = useCallback((message: IMessage | IForwardedMessage) => {
        setMessageForReply(message);
    }, []);

    const removeMessageForReply = useCallback(() => {
        setMessageForReply(null);
    }, []);

    const onChooseMessageForEdit = useCallback((message: IMessage) => {
        setMessageForEdit(message);
    }, []);

    const removeMessageForEdit = () => {
        setMessageForEdit(null);
    };

    const onChooseMessageForDelete = useCallback((message: IMessage | IForwardedMessage) => {
        setMessageForDelete({
            message,
            isForEveryone: false
        });
    }, []);

    const removeMessageForDelete = () => {
        setMessageForDelete(null);
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
            typingTimoutRef.current = null;
        }, 4000);
    };

    const onSendDeletedMessage = () => {
        if (!messageForDelete) return;

        void dispatch(deleteMessageSocket({
                messageId: messageForDelete.message.id,
                isForEveryone: messageForDelete.isForEveryone
            })
        );
        removeMessageForDelete();
    };

    const onSendEditedMessage = (text: TValueOf<Pick<IEditMessage, "text">>) => {
        if (!messageForEdit) return;

        void dispatch(editMessageSocket({
                messageId: messageForEdit.id,
                text: text
            })
        );
        removeMessageForEdit();
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
        void dispatch(sendMessageSocket(message));
        removeMessageForReply();
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
            case RoomType.PRIVATE: {
                if (!interlocutor || !interlocutor.userOnline.isOnline) {
                    return "Не в сети";
                } else if (room.participants[0].isTyping) {
                    return "Печатает...";
                }
                return "В сети";
            }
            case RoomType.GROUP: {
                const typingUsersText = room.participants
                    .filter(participant => participant.isTyping)
                    .map(participant => participant.nickname + "...")
                    .join(" ");
                return truncateTheText({
                    text: typingUsersText,
                    maxLength: 50
                });
            }
        }
    }, [room.participants, room.roomType, interlocutor]);

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
                    isNeedScrollToLastMessage={isNeedScrollToLastMessage}
                    onChooseMessageForEdit={onChooseMessageForEdit}
                    onChooseMessageForReply={onChooseMessageForReply}
                    onChooseMessageForDelete={onChooseMessageForDelete}
                    onOpenUsersListForForwardMessage={onOpenUsersListForForwardMessage}
                />

                <div className="active-room__footer">
                    {isVisibleScrollButtonState &&
                        <ScrollDownButton
                            onClick={onClickScrollButton}
                            amountUnreadMessages={0}
                        />
                    }
                    <InputMessage
                        messageForEdit={messageForEdit}
                        messageForReply={messageForReply}
                        removeMessageForReply={removeMessageForReply}
                        removeMessageForEdit={removeMessageForEdit}
                        onTyping={onTyping}
                        onSendMessage={onSendMessage}
                        onSendVoiceMessage={sendVoiceMessage}
                        onSendEditedMessage={onSendEditedMessage}
                    />
                </div>

                <Modal
                    title="Вы хотите удалить сообщение?"
                    onCancel={removeMessageForDelete}
                    onOk={onSendDeletedMessage}
                    open={!!messageForDelete}
                >
                    {room.roomType === RoomType.PRIVATE && messageForDelete && messageForDelete.message.senderId === user.id
                        ?
                        <Checkbox
                            checked={messageForDelete.isForEveryone}
                            onChange={event => {
                                setMessageForDelete({
                                    ...messageForDelete,
                                    isForEveryone: event.target.checked
                                });
                            }}
                        >
                            <Text>Удалить у всех</Text>
                        </Checkbox>
                        :
                        room.roomType === RoomType.PRIVATE && messageForDelete && messageForDelete.message.senderId !== user.id
                            ? <Text>Сообщение будет удалено только у вас.</Text>
                            : <Text>Сообщение будет удалено у всех в этом чате.</Text>
                    }
                </Modal>
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