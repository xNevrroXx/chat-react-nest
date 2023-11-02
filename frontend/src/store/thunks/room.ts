import {createAsyncThunk} from "@reduxjs/toolkit";
// services
import {RoomService} from "../../services/RoomService.ts";
import {SocketIOService} from "../../services/SocketIO.service.ts";
// actions
import {
    handleMessageSocket,
    handlePinnedMessageSocket,
    handleEditedMessageSocket,
    handleDeletedMessageSocket,
    handleChangeUserTypingSocket,
    handleForwardedMessageSocket
} from "../actions/room.ts";
import {handleChangeUserOnlineSocket} from "../actions/users.ts";
// types
import {
    checkIsInnerMessageHTTP,
    checkIsMessageHTTP,
    IFile,
    IRoom,
    IMessage,
    IEditMessage,
    TSendMessage,
    TSendUserTyping,
    IForwardMessage,
    IForwardedMessage,
    IInnerMessage,
    IInnerForwardedMessage,
    IDeleteMessage,
    IPinMessage,
    TTemporarilyRoomBySearch
} from "../../models/IStore/IRoom.ts";
import {RootState} from "../index.ts";

const createSocketInstance = createAsyncThunk<SocketIOService, string, { state: RootState }>(
    "room/socket:create-instance",
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
    "room/socket:connect",
    async (_, thunkApi) => {
        try {
            const socket = thunkApi.getState().room.socket;
            await socket?.connect();

            socket?.on("user:toggle-online", (data) => {
                thunkApi.dispatch(handleChangeUserOnlineSocket(data));
            });
            socket?.on("room:toggle-typing", (data) => {
                thunkApi.dispatch(handleChangeUserTypingSocket(data));
            });
            socket?.on("message", (data) => {
                thunkApi.dispatch(handleMessageSocket(data));
            });
            socket?.on("message:pinned", (data) => {
                thunkApi.dispatch(handlePinnedMessageSocket(data));
            });
            socket?.on("message:edited", (data) => {
                thunkApi.dispatch(handleEditedMessageSocket(data));
            });
            socket?.on("message:deleted", (data) => {
                thunkApi.dispatch(handleDeletedMessageSocket(data));
            });
            socket?.on("message:forwarded", (data) => {
                thunkApi.dispatch(handleForwardedMessageSocket(data));
            });
        } catch (error) {
            return thunkApi.rejectWithValue(error);
        }
    }
);

const disconnectSocket = createAsyncThunk<void, void, { state: RootState }>(
    "room/socket:disconnect",
    async (_, thunkApi) => {
        try {
            const socket = thunkApi.getState().room.socket;
            await socket?.disconnect();
            return;
        } catch (error) {
            return thunkApi.rejectWithValue(error);
        }
    }
);

const sendMessageSocket = createAsyncThunk<void, TSendMessage, { state: RootState }>(
    "room/socket:send-message",
    (data, thunkAPI) => {
        try {
            const socket = thunkAPI.getState().room.socket;
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

const pinMessageSocket  = createAsyncThunk<void, IPinMessage, { state: RootState }>(
    "room/socket:pin-message",
    (data, thunkAPI) => {
        try {
            const socket = thunkAPI.getState().room.socket;
            if (!socket) {
                throw new Error("There is no socket");
            }

            socket.emit("message:pin", [data]);
            return;
        } catch (error) {
            return thunkAPI.rejectWithValue(error);
        }
    }
);

const editMessageSocket = createAsyncThunk<void, IEditMessage, { state: RootState }>(
    "room/socket:edit-message",
    (data, thunkAPI) => {
        try {
            const socket = thunkAPI.getState().room.socket;
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

const deleteMessageSocket = createAsyncThunk<void, IDeleteMessage, { state: RootState }>(
    "room/socket:delete-message",
    (data, thunkAPI) => {
        try {
            const socket = thunkAPI.getState().room.socket;
            if (!socket) {
                throw new Error("There is no socket");
            }

            socket.emit("message:delete", [data]);
            return;
        } catch (error) {
            return thunkAPI.rejectWithValue(error);
        }
    }
);

const forwardMessageSocket = createAsyncThunk<void, IForwardMessage, { state: RootState }>(
    "room/socket:forward-message",
    (data, thunkAPI) => {
        try {
            const socket = thunkAPI.getState().room.socket;
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
    "room/socket:send-toggle-typing",
    (data, thunkAPI) => {
        try {
            const socket = thunkAPI.getState().room.socket;
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
    "room/get-all",
    async (_, thunkAPI) => {
        try {
            const response = await RoomService.getAll();
            const chatsHTTPResponse = response.data;
            const chats: IRoom[] = [];
            chatsHTTPResponse.forEach(room => {
                const messages = room.messages.reduce<(IMessage | IForwardedMessage)[]>((previousValue, messageHTTP) => {
                    let message: IMessage | IForwardedMessage;
                    let newMessage = {} as (IMessage | IForwardedMessage);
                    let innerMessage: IInnerMessage | IInnerForwardedMessage | null;
                    if (checkIsMessageHTTP(messageHTTP)) {
                        const files = messageHTTP.files.map<IFile>(file => {
                            const u = new Uint8Array(file.buffer.data);
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

                        newMessage = {
                            ...messageHTTP,
                            files: files,
                            replyToMessage: undefined, // temporarily
                            createdAt: messageHTTP.createdAt,
                            updatedAt: messageHTTP.updatedAt,
                        } as IMessage;

                        if (messageHTTP.replyToMessage) {
                            if (checkIsInnerMessageHTTP(messageHTTP.replyToMessage)) {
                                const innerFiles = messageHTTP.replyToMessage.files.map<IFile>(file => {
                                    const u = new Uint8Array(file.buffer.data);
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
                                    ...messageHTTP.replyToMessage,
                                    files: innerFiles,
                                    createdAt: messageHTTP.replyToMessage.createdAt,
                                    updatedAt: messageHTTP.replyToMessage.updatedAt,
                                };
                            }
                            else {
                                innerMessage = {
                                    ...messageHTTP.replyToMessage,
                                    createdAt: messageHTTP.replyToMessage.createdAt,
                                    updatedAt: messageHTTP.replyToMessage.updatedAt,
                                };
                            }
                            newMessage.replyToMessage = innerMessage;
                        }

                        message = newMessage;
                    }
                    else {
                        newMessage = {
                            ...messageHTTP,
                            forwardedMessage: null as unknown as IInnerMessage, // temporarily
                        } as IForwardedMessage;

                        if (messageHTTP.forwardedMessage) {
                            if (checkIsInnerMessageHTTP(messageHTTP.forwardedMessage)) {
                                const innerFiles = messageHTTP.forwardedMessage.files.map<IFile>(file => {
                                    const u = new Uint8Array(file.buffer.data);
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
                                    ...messageHTTP.forwardedMessage,
                                    files: innerFiles,
                                    createdAt: messageHTTP.forwardedMessage.createdAt,
                                    updatedAt: messageHTTP.forwardedMessage.updatedAt,
                                };
                            } else {
                                innerMessage = {
                                    ...messageHTTP.forwardedMessage,
                                    createdAt: messageHTTP.forwardedMessage.createdAt,
                                    updatedAt: messageHTTP.forwardedMessage.updatedAt,
                                };
                            }
                            newMessage.forwardedMessage = innerMessage;
                        }
                        message = newMessage;
                    }

                    previousValue.push(message);
                    return previousValue;
                }, []);

                chats.push({
                    ...room,
                    messages
                });
            });

            return chats;
        } catch (error) {
            return thunkAPI.rejectWithValue(error);
        }
    }
);

const createRoom = createAsyncThunk<IRoom, TTemporarilyRoomBySearch>(
    "room/create",
    async (newRoomData, thunkAPI) => {
        try {
            const response = await RoomService.create(newRoomData);
            return response.data;
        }
        catch(error) {
            return thunkAPI.rejectWithValue(error);
        }
    }
);

export {
    getAll,
    createRoom,

    createSocketInstance,
    disconnectSocket,
    connectSocket,
    sendMessageSocket,
    pinMessageSocket,
    editMessageSocket,
    deleteMessageSocket,
    forwardMessageSocket,
    toggleUserTypingSocket
};
