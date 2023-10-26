import {createSlice} from "@reduxjs/toolkit";
// interfaces
import type {IChats, IInnerMessage, TFile} from "../../models/IStore/IChats.ts";
import {
    Attachment,
    checkIsInnerMessageFromSocket,
    ForwardedMessage,
    IMessage,
    InnerForwardedMessage,
    InnerMessage,
    Message, RoomType,
} from "../../models/IStore/IChats.ts";
// actions
import {createSocketInstance, getAll} from "../thunks/chat.ts";
import {
    handleEditedMessageSocket,
    handleForwardedMessageSocket,
    handleMessageSocket,
    handleUserToggleTypingSocket,
    setUserId
} from "../actions/chat.ts";


const initialState: IChats = {
    userId: "",
    chats: [],
    socket: null
};

const chat = createSlice({
    name: "chat",
    initialState,
    reducers: {},
    extraReducers: builder => {
        builder
            .addCase(setUserId, (state, action) => {
                state.userId = action.payload;
            })
            .addCase(createSocketInstance.fulfilled, (state, action) => {
                // @ts-ignore
                state.socket = action.payload;
            })
            .addCase(handleMessageSocket, (state, action) => {
                const targetChat = state.chats.find(chat => chat.id === action.payload.roomId);
                const messageSocket = action.payload;
                const newMessage: IMessage = {
                    ...messageSocket,
                    files: [], // temporarily
                    replyToMessage: null, // temporarily
                    createdAt: new Date(messageSocket.createdAt),
                    updatedAt: messageSocket.updatedAt ? new Date(messageSocket.updatedAt) : null,
                };
                let innerMessage: InnerMessage | InnerForwardedMessage | null;
                newMessage.files = messageSocket.files.map<TFile>(file => {
                    const u = new Uint8Array(file.buffer); // file.buffer.data
                    const blob = new Blob([u], {type: file.mimeType});
                    return new Attachment({
                        id: file.id,
                        originalName: file.originalName,
                        fileType: file.fileType,
                        mimeType: file.mimeType,
                        extension: file.extension,
                        blob: blob,

                        createdAt: new Date(file.createdAt)
                    });
                });

                if (messageSocket.replyToMessage) {
                    if (checkIsInnerMessageFromSocket(messageSocket.replyToMessage)) {
                        const innerFiles = messageSocket.replyToMessage.files.map<TFile>(file => {
                            const u = new Uint8Array(file.buffer); // file.buffer.data
                            const blob = new Blob([u], {type: file.mimeType});
                            return new Attachment({
                                id: file.id,
                                originalName: file.originalName,
                                fileType: file.fileType,
                                mimeType: file.mimeType,
                                extension: file.extension,
                                blob: blob,

                                createdAt: new Date(file.createdAt)
                            });
                        });

                        innerMessage = new InnerMessage({
                            ...messageSocket.replyToMessage,
                            files: innerFiles,
                            createdAt: new Date(messageSocket.replyToMessage.createdAt),
                            updatedAt: messageSocket.replyToMessage.updatedAt ? new Date(messageSocket.replyToMessage.updatedAt) : null,
                        });
                    } else {
                        innerMessage = new InnerForwardedMessage({
                            ...messageSocket.replyToMessage,
                            createdAt: new Date(messageSocket.replyToMessage.createdAt),
                            updatedAt: messageSocket.replyToMessage.updatedAt ? new Date(messageSocket.replyToMessage.updatedAt) : null,
                        });
                    }

                    newMessage.replyToMessage = innerMessage;
                }

                const message = new Message(newMessage);

                if (!targetChat) {
                    state.chats.push({ // todo repair of the getting first message in the unrecognized room
                        id: message.roomId,
                        userId: "",
                        name: "",
                        participants: [],
                        roomType: RoomType.PRIVATE,
                        messages: [message],
                        createdAt: new Date(),
                        updatedAt: undefined
                    });
                }
                else {
                    targetChat.messages.push(message);
                }
            })
            .addCase(handleForwardedMessageSocket, (state, action) => {
                const targetChat = state.chats.find(chat => chat.id === action.payload.roomId);
                const messageSocket = action.payload;
                let innerMessage: InnerMessage | InnerForwardedMessage | null;

                const newMessage: ForwardedMessage = {
                    ...messageSocket,
                    forwardedMessage: null as unknown as IInnerMessage, // temporarily
                    createdAt: new Date(messageSocket.createdAt),
                    updatedAt: messageSocket.updatedAt ? new Date(messageSocket.updatedAt) : null
                };

                if (messageSocket.forwardedMessage) {
                    if (checkIsInnerMessageFromSocket(messageSocket.forwardedMessage)) {
                        const innerFiles = messageSocket.forwardedMessage.files.map<TFile>(file => {
                            const u = new Uint8Array(file.buffer); // file.buffer.data
                            const blob = new Blob([u], {type: file.mimeType});
                            return new Attachment({
                                id: file.id,
                                originalName: file.originalName,
                                fileType: file.fileType,
                                mimeType: file.mimeType,
                                extension: file.extension,
                                blob: blob,

                                createdAt: new Date(file.createdAt)
                            });
                        });

                        innerMessage = new InnerMessage({
                            ...messageSocket.forwardedMessage,
                            files: innerFiles,
                            createdAt: new Date(messageSocket.forwardedMessage.createdAt),
                            updatedAt: messageSocket.forwardedMessage.updatedAt ? new Date(messageSocket.forwardedMessage.updatedAt) : null,
                        });
                    } else {
                        innerMessage = new InnerForwardedMessage({
                            ...messageSocket.forwardedMessage,
                            createdAt: new Date(messageSocket.forwardedMessage.createdAt),
                            updatedAt: messageSocket.forwardedMessage.updatedAt ? new Date(messageSocket.forwardedMessage.updatedAt) : null,
                        });
                    }
                    newMessage.forwardedMessage = innerMessage;
                }
                const message = new ForwardedMessage(newMessage);

                if (!targetChat) {
                    state.chats.push({ // todo repair of the getting first message in the unrecognized room
                        id: message.roomId,
                        userId: "",
                        name: "",
                        participants: [],
                        roomType: RoomType.PRIVATE,
                        messages: [message],
                        createdAt: new Date(),
                        updatedAt: undefined
                    });
                }
                else {
                    targetChat.messages.push(message);
                }
            })
            .addCase(handleEditedMessageSocket, (state, action) => {
                const targetChat = state.chats.find(chat => chat.id === action.payload.roomId);
                if (!targetChat) return;

                const targetMessage = targetChat.messages.find(chat => chat.id === action.payload.messageId);
                if (!targetMessage) return;
                targetMessage.text = action.payload.text;
            })
            .addCase(handleUserToggleTypingSocket, (state, action) => {
                const targetChat = state.chats.find(chat => chat.id === action.payload[0].roomId);
                if (!targetChat) {
                    return;
                }

                targetChat.participants = action.payload;
            })
            .addCase(getAll.fulfilled, (state, action) => {
                state.chats = action.payload;
            });
    }
});

const {reducer} = chat;

export default reducer;