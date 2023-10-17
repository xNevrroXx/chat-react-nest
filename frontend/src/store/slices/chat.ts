import {createSlice} from "@reduxjs/toolkit";
// interfaces
import type {IChats, TFile} from "../../models/IStore/IChats.ts";
// actions
import {createSocketInstance, getAll} from "../thunks/chat.ts";
import {
    setUserId,
    handleMessageSocket,
    handleForwardedMessageSocket,
    handleUserToggleTypingSocket
} from "../actions/chat.ts";
import {
    ForwardedMessage,
    checkIsForwardedMessage,
    Message,
    checkIsInnerMessageHTTPResponse, IInnerMessage, checkIsInnerMessageFromSocket, IMessage, IForwardedMessage
} from "../../models/IStore/IChats.ts";


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
                const interlocutorId = state.userId === action.payload.senderId ? action.payload.recipientId : action.payload.senderId;

                const targetChat = state.chats.find(chat => chat.userId === interlocutorId);
                const messageSocket = action.payload;
                let newMessage = {} as IMessage;
                const files: TFile[] = messageSocket.files.map(file => {
                    const u = new Uint8Array(file.buffer);
                    const blob = new Blob([u], {type: file.mimeType});
                    return {
                        id: file.id,
                        originalName: file.originalName,
                        fileType: file.fileType,
                        mimeType: file.mimeType,
                        extension: file.extension,
                        createdAt: file.createdAt,
                        blob: blob
                    };
                });

                newMessage = {
                    ...messageSocket,
                    files,
                };

                if (messageSocket.replyToMessage && checkIsInnerMessageFromSocket(messageSocket.replyToMessage)) {
                    const innerFiles = messageSocket.replyToMessage.files.map<TFile>(file => {
                        const u = new Uint8Array(file.buffer);
                        const blob = new Blob([u], {type: file.mimeType});
                        return {
                            id: file.id,
                            originalName: file.originalName,
                            fileType: file.fileType,
                            mimeType: file.mimeType,
                            extension: file.extension,
                            createdAt: file.createdAt,
                            blob: blob
                        };
                    });
                    (newMessage.replyToMessage as IInnerMessage).files = innerFiles;
                }

                const message = new Message(newMessage);

                if (!targetChat) {
                    state.chats.push({
                        userId: interlocutorId,
                        messages: [message],
                        isTyping: false
                    });
                    return;
                }

                targetChat.messages.push(message);
            })
            .addCase(handleForwardedMessageSocket, (state, action) => {
                const interlocutorId = state.userId === action.payload.senderId ? action.payload.recipientId : action.payload.senderId;

                const targetChat = state.chats.find(chat => chat.userId === interlocutorId);
                const messageSocket = action.payload;

                let newMessage = {} as IForwardedMessage;
                newMessage = {...messageSocket};
                if (messageSocket.forwardedMessage && checkIsInnerMessageFromSocket(messageSocket.forwardedMessage)) {
                    const innerFiles = messageSocket.forwardedMessage.files.map<TFile>(file => {
                        const u = new Uint8Array(file.buffer);
                        const blob = new Blob([u], {type: file.mimeType});
                        return {
                            id: file.id,
                            originalName: file.originalName,
                            fileType: file.fileType,
                            mimeType: file.mimeType,
                            extension: file.extension,
                            createdAt: file.createdAt,
                            blob: blob
                        };
                    });
                    (newMessage.forwardedMessage as IInnerMessage).files = innerFiles;
                }
                const message = new ForwardedMessage(newMessage);

                if (!targetChat) {
                    state.chats.push({
                        userId: interlocutorId,
                        messages: [message],
                        isTyping: false
                    });
                    return;
                }

                targetChat.messages.push(message);
            })
            .addCase(getAll.fulfilled, (state, action) => {
                state.chats = action.payload;
            })
            .addCase(handleUserToggleTypingSocket, (state, action) => {
                const targetChat = state.chats.find(chat => chat.userId === action.payload.userTargetId);
                if (!targetChat) {
                    return;
                }

                targetChat.isTyping = action.payload.isTyping;
            });
    }
});

const {reducer} = chat;

export default reducer;