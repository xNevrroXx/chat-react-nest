import {createAsyncThunk} from "@reduxjs/toolkit";
// services
import {ChatService} from "../../services/Chat.service.ts";
import {SocketIOService} from "../../services/SocketIO.service.ts";
// actions
import {
    handleEditedMessageSocket,
    handleForwardedMessageSocket,
    handleMessageSocket,
    handleUserToggleTypingSocket
} from "../actions/chat.ts";
import {handleUserToggleOnlineSocket} from "../actions/users.ts";
// types
import {
    checkIsInnerMessageHTTP,
    checkIsMessageHTTP,
    IRoom,
    IForwardedMessage,
    IMessage,
    TFile,
    TForwardMessage,
    TSendMessage,
    Message,
    ForwardedMessage,
    InnerMessage,
    InnerForwardedMessage, Attachment, TSendUserTyping, IEditMessage
} from "../../models/IStore/IChats.ts";
import {RootState} from "../index.ts";

const createSocketInstance = createAsyncThunk<SocketIOService, string, {
    state: RootState
}>(
    "chat/socket:create-instance",
    (token: string, thunkAPI) => {
        try {
            const socket = new SocketIOService(token);
            void thunkAPI.dispatch(connectSocket());
            return socket;
        } catch (error) {
            return thunkAPI.rejectWithValue(error);
        }
    }
);

const connectSocket = createAsyncThunk<void, void, { state: RootState }>(
    "chat/socket:connect",
    async (_, thunkApi) => {
        try {
            const socket = thunkApi.getState().chat.socket;
            await socket?.connect();

            socket?.on("message", (data) => {
                thunkApi.dispatch(handleMessageSocket(data));
            });
            socket?.on("message:forwarded", (data) => {
                thunkApi.dispatch(handleForwardedMessageSocket(data));
            });
            socket?.on("user:toggle-online", (data) => {
                thunkApi.dispatch(handleUserToggleOnlineSocket(data));
            });
            socket?.on("room:toggle-typing", (data) => {
                thunkApi.dispatch(handleUserToggleTypingSocket(data));
            });
            socket?.on("message:edited", (data) => {
                thunkApi.dispatch(handleEditedMessageSocket(data));
            });
        } catch (error) {
            return thunkApi.rejectWithValue(error);
        }
    }
);

const disconnectSocket = createAsyncThunk<void, void, { state: RootState }>(
    "chat/socket:disconnect",
    async (_, thunkApi) => {
        try {
            const socket = thunkApi.getState().chat.socket;
            await socket?.disconnect();
            return;
        } catch (error) {
            return thunkApi.rejectWithValue(error);
        }
    }
);

const sendMessageSocket = createAsyncThunk<void, TSendMessage, { state: RootState }>(
    "chat/socket:send-message",
    (data, thunkAPI) => {
        try {
            const socket = thunkAPI.getState().chat.socket;
            if (!socket) {
                throw new Error("There is no socket");
            }

            socket.emit("message", [data]);
            return;
        } catch (error) {
            return thunkAPI.rejectWithValue(error);
        }
    }
);

const editMessageSocket = createAsyncThunk<void, IEditMessage, { state: RootState }>(
    "chat/socket:edit-message",
    (data, thunkAPI) => {
        try {
            const socket = thunkAPI.getState().chat.socket;
            if (!socket) {
                throw new Error("There is no socket");
            }

            socket.emit("message:edit", [data]);
            return;
        } catch (error) {
            return thunkAPI.rejectWithValue(error);
        }
    }
);

const forwardMessageSocket = createAsyncThunk<void, TForwardMessage, { state: RootState }>(
    "chat/socket:forward-message",
    (data, thunkAPI) => {
        try {
            const socket = thunkAPI.getState().chat.socket;
            if (!socket) {
                throw new Error("There is no socket");
            }

            socket.emit("message:forward", [data]);
            return;
        } catch (error) {
            return thunkAPI.rejectWithValue(error);
        }
    }
);

const toggleUserTypingSocket = createAsyncThunk<void, TSendUserTyping, { state: RootState }>(
    "chat/socket:send-toggle-typing",
    (data, thunkAPI) => {
        try {
            const socket = thunkAPI.getState().chat.socket;
            if (!socket) {
                throw new Error("There is no socket");
            }

            socket.emit("user:toggle-typing", [data]);
            return;
        } catch (error) {
            return thunkAPI.rejectWithValue(error);
        }
    }
);

const getAll = createAsyncThunk(
    "chat/get-all",
    async (_, thunkAPI) => {
        try {
            const response = await ChatService.getAll();
            const chatsHTTPResponse = response.data;
            const chats: IRoom[] = [];
            chatsHTTPResponse.forEach(chat => {
                const messages = chat.messages.reduce<(Message | ForwardedMessage)[]>((previousValue, messageHTTP) => {
                    let message: Message | ForwardedMessage;
                    let newMessage = {} as IMessage | IForwardedMessage;
                    let innerMessage: InnerMessage | InnerForwardedMessage | null;
                    if (checkIsMessageHTTP(messageHTTP)) {
                        const files = messageHTTP.files.map<TFile>(file => {
                            const u = new Uint8Array(file.buffer.data);
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

                        newMessage = {
                            ...messageHTTP,
                            files: files,
                            replyToMessage: null, // temporarily
                            createdAt: new Date(messageHTTP.createdAt),
                            updatedAt: messageHTTP.updatedAt ? new Date(messageHTTP.updatedAt) : null,
                        };

                        if (messageHTTP.replyToMessage) {
                            if (checkIsInnerMessageHTTP(messageHTTP.replyToMessage)) {
                                const innerFiles = messageHTTP.replyToMessage.files.map<TFile>(file => {
                                    const u = new Uint8Array(file.buffer.data);
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
                                    ...messageHTTP.replyToMessage,
                                    files: innerFiles,
                                    createdAt: new Date(messageHTTP.replyToMessage.createdAt),
                                    updatedAt: messageHTTP.replyToMessage.updatedAt ? new Date(messageHTTP.replyToMessage.updatedAt) : null,
                                });
                            } else {
                                innerMessage = new InnerForwardedMessage({
                                    ...messageHTTP.replyToMessage,
                                    createdAt: new Date(messageHTTP.replyToMessage.createdAt),
                                    updatedAt: messageHTTP.replyToMessage.updatedAt ? new Date(messageHTTP.replyToMessage.updatedAt) : null,
                                });
                            }

                            newMessage.replyToMessage = innerMessage;
                        }
                        message = new Message(newMessage);
                    } else {
                        newMessage = {
                            ...messageHTTP,
                            forwardedMessage: null as unknown as InnerMessage, // temporarily
                            createdAt: new Date(messageHTTP.createdAt),
                            updatedAt: messageHTTP.updatedAt ? new Date(messageHTTP.updatedAt) : null
                        };

                        if (messageHTTP.forwardedMessage) {
                            if (checkIsInnerMessageHTTP(messageHTTP.forwardedMessage)) {
                                const innerFiles = messageHTTP.forwardedMessage.files.map<TFile>(file => {
                                    const u = new Uint8Array(file.buffer.data);
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
                                    ...messageHTTP.forwardedMessage,
                                    files: innerFiles,
                                    createdAt: new Date(messageHTTP.forwardedMessage.createdAt),
                                    updatedAt: messageHTTP.forwardedMessage.updatedAt ? new Date(messageHTTP.forwardedMessage.updatedAt) : null,
                                });
                            } else {
                                innerMessage = new InnerForwardedMessage({
                                    ...messageHTTP.forwardedMessage,
                                    createdAt: new Date(messageHTTP.forwardedMessage.createdAt),
                                    updatedAt: messageHTTP.forwardedMessage.updatedAt ? new Date(messageHTTP.forwardedMessage.updatedAt) : null,
                                });
                            }
                            newMessage.forwardedMessage = innerMessage;
                        }
                        message = new ForwardedMessage(newMessage);
                    }

                    previousValue.push(message);
                    return previousValue;
                }, []);

                chats.push({
                    ...chat,
                    messages
                });
            });

            return chats;
        } catch (error) {
            return thunkAPI.rejectWithValue(error);
        }
    }
);

export {
    getAll,
    createSocketInstance,
    disconnectSocket,
    connectSocket,
    sendMessageSocket,
    editMessageSocket,
    forwardMessageSocket,
    toggleUserTypingSocket
};
