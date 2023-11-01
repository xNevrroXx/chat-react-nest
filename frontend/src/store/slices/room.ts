import {createSlice} from "@reduxjs/toolkit";
// interfaces
import type {
    IInnerMessage,
    IFile,
    IInnerForwardedMessage,
    IForwardedMessage
} from "../../models/IStore/IRoom.ts";
import {
    checkIsInnerMessageSocket,
    IMessage, IRoomSlice,
    RoomType,
} from "../../models/IStore/IRoom.ts";
// actions
import {
    getAll,
    createRoom,
    createSocketInstance
} from "../thunks/room.ts";
import {
    setUserId,
    handleEditedMessageSocket,
    handleForwardedMessageSocket,
    handleMessageSocket,
    handleChangeUserTypingSocket,
    handleDeletedMessageSocket,
    handlePinnedMessageSocket
} from "../actions/room.ts";


const initialState: IRoomSlice = {
    userId: "",
    rooms: [],
    socket: null
};

const room = createSlice({
    name: "room",
    initialState,
    reducers: {},
    extraReducers: builder => {
        builder
            .addCase(getAll.fulfilled, (state, action) => {
                state.rooms = action.payload;
            })
            .addCase(createRoom.fulfilled, (state, action) => {
                state.rooms.push(action.payload);
            })
            .addCase(setUserId, (state, action) => {
                state.userId = action.payload;
            })
            .addCase(createSocketInstance.fulfilled, (state, action) => {
                // @ts-ignore
                state.socket = action.payload;
            })
            .addCase(handleMessageSocket, (state, action) => {
                const targetChat = state.rooms.find(chat => chat.id === action.payload.roomId);
                const messageSocket = action.payload;
                const newMessage: IMessage = {
                    ...messageSocket,
                    files: [], // temporarily
                    replyToMessage: null, // temporarily
                };
                let innerMessage: IInnerMessage | IInnerForwardedMessage | null;
                newMessage.files = messageSocket.files.map<IFile>(file => {
                    const u = new Uint8Array(file.buffer); // file.buffer.data
                    const blob = new Blob([u], {type: file.mimeType});
                    return {
                        id: file.id,
                        originalName: file.originalName,
                        fileType: file.fileType,
                        mimeType: file.mimeType,
                        extension: file.extension,
                        blob: blob,

                        createdAt: file.createdAt
                    };
                });

                if (messageSocket.replyToMessage) {
                    if (checkIsInnerMessageSocket(messageSocket.replyToMessage)) {
                        const innerFiles = messageSocket.replyToMessage.files.map<IFile>(file => {
                            const u = new Uint8Array(file.buffer); // file.buffer.data
                            const blob = new Blob([u], {type: file.mimeType});
                            return {
                                id: file.id,
                                originalName: file.originalName,
                                fileType: file.fileType,
                                mimeType: file.mimeType,
                                extension: file.extension,
                                blob: blob,

                                createdAt: file.createdAt
                            };
                        });

                        innerMessage = {
                            ...messageSocket.replyToMessage,
                            files: innerFiles
                        };
                    }
                    else {
                        innerMessage = messageSocket.replyToMessage;
                    }

                    newMessage.replyToMessage = innerMessage;
                }

                const message = newMessage;

                if (!targetChat) {
                    state.rooms.push({ // todo repair of the getting first message in the unrecognized room
                        id: message.roomId,
                        userId: "",
                        name: "",
                        participants: [],
                        roomType: RoomType.PRIVATE,
                        messages: [message],
                        pinnedMessages: [],

                        createdAt: "",
                        updatedAt: undefined
                    });
                }
                else {
                    targetChat.messages.push(message);
                }
            })
            .addCase(handleForwardedMessageSocket, (state, action) => {
                const targetChat = state.rooms.find(chat => chat.id === action.payload.roomId);
                const messageSocket = action.payload;
                let innerMessage: IInnerMessage | IInnerForwardedMessage | null;

                const newMessage: IForwardedMessage = {
                    ...messageSocket,
                    forwardedMessage: null as unknown as IInnerMessage, // temporarily
                };

                if (messageSocket.forwardedMessage) {
                    if (checkIsInnerMessageSocket(messageSocket.forwardedMessage)) {
                        const innerFiles = messageSocket.forwardedMessage.files.map<IFile>(file => {
                            const u = new Uint8Array(file.buffer); // file.buffer.data
                            const blob = new Blob([u], {type: file.mimeType});
                            return {
                                id: file.id,
                                originalName: file.originalName,
                                fileType: file.fileType,
                                mimeType: file.mimeType,
                                extension: file.extension,
                                blob: blob,

                                createdAt: file.createdAt
                            };
                        });

                        innerMessage = {
                            ...messageSocket.forwardedMessage,
                            files: innerFiles
                        };
                    } else {
                        innerMessage = {
                            ...messageSocket.forwardedMessage,
                            createdAt: messageSocket.forwardedMessage.createdAt,
                            updatedAt: messageSocket.forwardedMessage.updatedAt,
                        };
                    }
                    newMessage.forwardedMessage = innerMessage;
                }
                const message = newMessage;

                if (!targetChat) {
                    state.rooms.push({ // todo repair of the getting first message in the unrecognized room
                        id: message.roomId,
                        userId: "",
                        name: "",
                        participants: [],
                        roomType: RoomType.PRIVATE,
                        messages: [message],
                        pinnedMessages: [],

                        createdAt: "",
                        updatedAt: undefined
                    });
                }
                else {
                    targetChat.messages.push(message);
                }
            })
            .addCase(handlePinnedMessageSocket, (state, action) => {
                const targetRoom = state.rooms.find(chat => chat.id === action.payload.roomId);
                if (!targetRoom) return;

                targetRoom.pinnedMessages = action.payload.messages;
            })
            .addCase(handleEditedMessageSocket, (state, action) => {
                const targetChat = state.rooms.find(chat => chat.id === action.payload.roomId);
                if (!targetChat) return;

                const targetMessage = targetChat.messages.find(chat => chat.id === action.payload.messageId);
                if (!targetMessage) return;
                targetMessage.text = action.payload.text;
            })
            .addCase(handleDeletedMessageSocket, (state, action) => {
                const targetChat = state.rooms.find(chat => chat.id === action.payload.roomId);
                if (!targetChat) return;

                const targetMessage = targetChat.messages.find(chat => chat.id === action.payload.messageId);
                if (!targetMessage) return;
                targetMessage.isDeleted = action.payload.isDeleted;
            })
            .addCase(handleChangeUserTypingSocket, (state, action) => {
                const targetChat = state.rooms.find(chat => chat.id === action.payload[0].roomId);
                if (!targetChat) {
                    return;
                }

                targetChat.participants = action.payload;
            });
    }
});

const {reducer} = room;

export default reducer;