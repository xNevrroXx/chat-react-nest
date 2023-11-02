import {MenuFoldOutlined, PhoneTwoTone} from "@ant-design/icons";
import {Avatar, Checkbox, Flex, Modal, theme, Typography} from "antd";
import React, {type FC, Fragment, useCallback, useMemo, useRef, useState} from "react";
// own modules
import {useScrollTrigger} from "../../hooks/useScrollTrigger.hook.ts";
import RoomContent from "../../components/RoomContent/RoomContent.tsx";
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
} from "../../models/IStore/IRoom.ts";
// actions
import {useAppDispatch, useAppSelector} from "../../hooks/store.hook.ts";
import {
    deleteMessageSocket,
    editMessageSocket,
    pinMessageSocket,
    sendMessageSocket,
    toggleUserTypingSocket
} from "../../store/thunks/room.ts";
import {truncateTheText} from "../../utils/truncateTheText.ts";
import PinnedMessagesList from "../../components/PinnedMessagesList/PinnedMessagesList.tsx";
// styles
import "./active-room.scss";

const {useToken} = theme;
const {Text, Title} = Typography;

interface IActiveChatProps {
    user: IUserDto;
    room: IRoom | null
    onOpenUsersListForForwardMessage: (forwardedMessageId: TValueOf<Pick<IForwardMessage, "forwardedMessageId">>) => void;
}

const ActiveRoom: FC<IActiveChatProps> = ({user, room, onOpenUsersListForForwardMessage}) => {
    const {token} = useToken();
    const dispatch = useAppDispatch();
    const interlocutor = useAppSelector(state => {
        if (!room || room.type === RoomType.GROUP) return;
        return state.users.users.find(user => user.id === room.participants[0].userId);
    });
    const [messageForEdit, setMessageForEdit] = useState<IMessage | null>(null);
    const [messageForPin, setMessageForPin] = useState<IMessage | IForwardedMessage | null>(null);
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

    const onChooseMessageForPin = useCallback((message: IMessage | IForwardedMessage) => {
        setMessageForPin(message);
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

    const removeMessageForDelete = useCallback(() => {
        setMessageForDelete(null);
    }, []);

    const removeMessageForPin = useCallback(() => {
        setMessageForPin(null);
    }, []);

    const onTyping = useCallback(() => {
        if (!room) return;
        
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
    }, [dispatch, room]);

    const onDeleteMessage = () => {
        if (!messageForDelete) return;

        void dispatch(deleteMessageSocket({
                messageId: messageForDelete.message.id,
                isForEveryone: messageForDelete.isForEveryone
            })
        );
        removeMessageForDelete();
    };

    const onPinMessage = useCallback(() => {
        if (!room || !messageForPin) return;

        void dispatch(pinMessageSocket({
                roomId: room.id,
                messageId: messageForPin.id
            })
        );
        removeMessageForPin();
    }, [dispatch, messageForPin, removeMessageForPin, room]);

    const onSendEditedMessage = (text: TValueOf<Pick<IEditMessage, "text">>) => {
        if (!messageForEdit) return;

        void dispatch(editMessageSocket({
                messageId: messageForEdit.id,
                text: text
            })
        );
        removeMessageForEdit();
    };

    const onSendMessage = useCallback((text: TValueOf<Pick<TSendMessage, "text">>, attachments: IAttachment[]) => {
        if (!room) return;

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
    }, [room, messageForReply, dispatch, removeMessageForReply]);

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
        if (!room || !room.participants || room.participants.length === 0) {
            return;
        }

        switch (room.type) {
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
    }, [room, interlocutor]);

    const content = (): JSX.Element => {
        if (!room) {
            return (
                <Flex
                    className="active-room__not-exist"
                    justify="center"
                    align="center"
                >
                    <Title level={5} style={{color: token.colorTextSecondary}}>Выберите чат</Title>
                </Flex>
            );
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

                { room.pinnedMessages.length > 0 &&
                    <div>
                        <PinnedMessagesList pinnedMessages={room.pinnedMessages}/>
                    </div>
                }
                
                <RoomContent
                    className="active-room__content"
                    ref={refChatContent}
                    user={user}
                    room={room}
                    isNeedScrollToLastMessage={isNeedScrollToLastMessage}
                    onChooseMessageForPin={onChooseMessageForPin}
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
                    onOk={onDeleteMessage}
                    open={!!messageForDelete}
                >
                    {room.type === RoomType.PRIVATE && messageForDelete && messageForDelete.message.senderId === user.id
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
                        room.type === RoomType.PRIVATE
                            ? <Text>Сообщение будет удалено только у вас.</Text>
                            : <Text>Сообщение будет удалено у всех в этом чате.</Text>
                    }
                </Modal>

                <Modal
                    title="Вы хотели бы закрепить сообщение?"
                    onCancel={removeMessageForPin}
                    onOk={onPinMessage}
                    open={!!messageForPin}
                />
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