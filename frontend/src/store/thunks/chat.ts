import {createAsyncThunk} from "@reduxjs/toolkit";
// services
import {ChatService} from "../../services/Chat.service.ts";
import {SocketIOService} from "../../services/SocketIO.service.ts";
// actions
import {handleMessageSocket, handleUserToggleTypingSocket} from "../actions/chat.ts";
import {handleUserToggleOnlineSocket} from "../actions/users.ts";
// types
import {
    IChat,
    TFile,
    IMessage,
    TSendMessage,
    TUserTyping
} from "../../models/IStore/IChats.ts";
import {RootState} from "../index.ts";

const createSocketInstance = createAsyncThunk<InstanceType<typeof SocketIOService> | undefined, string, {state: RootState}>(
    "chat/socket:create-instance",
    (token: string, thunkAPI) => {
        try {
            const socket = new SocketIOService(token);
            void thunkAPI.dispatch(connectSocket());
            return socket;
        }
        catch (error) {
            thunkAPI.rejectWithValue(error);
        }
    }
);

const connectSocket = createAsyncThunk<void, void, {state: RootState}>(
    "chat/socket:connect",
    async(_, thunkApi) => {
        try {
            const socket = thunkApi.getState().chat.socket;
            await socket?.connect();

            socket?.on("message", (data) => {
                thunkApi.dispatch(handleMessageSocket(data));
            });
            socket?.on("user:toggle-online", (data) => {
                thunkApi.dispatch(handleUserToggleOnlineSocket(data));
            });
            socket?.on("user:toggle-typing", (data) => {
                thunkApi.dispatch(handleUserToggleTypingSocket(data));
            });
        }
        catch (error) {
            thunkApi.rejectWithValue(error);
        }
    }
);

const disconnectSocket = createAsyncThunk<void, void, {state: RootState}>(
    "chat/socket:disconnect",
    async(_, thunkApi) => {
        try {
            const socket = thunkApi.getState().chat.socket;
            await socket?.disconnect();
            return;
        }
        catch (error) {
            thunkApi.rejectWithValue(error);
        }
    }
);

const sendMessageSocket = createAsyncThunk<void, TSendMessage, {state: RootState}>(
    "chat/socket:send-message",
    (data, thunkAPI) => {
        try {
            const socket = thunkAPI.getState().chat.socket;
            if (!socket) {
                throw new Error("There is no socket");
            }

            socket.emit("message", [data]);
            return;
        }
        catch (error) {
            thunkAPI.rejectWithValue(error);
        }
    }
);

const toggleUserTypingSocket = createAsyncThunk<void, TUserTyping, {state: RootState}>(
    "chat/socket:send-toggle-typing",
    (data, thunkAPI) => {
        try {
            const socket = thunkAPI.getState().chat.socket;
            if (!socket) {
                throw new Error("There is no socket");
            }

            socket.emit("user:toggle-typing", [data]);
            return;
        }
        catch (error) {
            thunkAPI.rejectWithValue(error);
        }
    }
);

const getAll = createAsyncThunk(
    "chat/get-all",
    async(_, thunkAPI) => {
        try {
            const response = await ChatService.getAll();
            const chatsHTTPResponse = response.data;
            const chats: IChat[] = [];
            chatsHTTPResponse.forEach(chat => {
                const messages: IMessage[] = chat.messages.map((message) => {
                    const files = message.files.map<TFile>(file => {
                        const u = new Uint8Array(file.buffer.data);
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

                    return {
                        ...message,
                        files
                    };
                });

                chats.push({
                    ...chat,
                    messages
                });
            });

            return chats;
        }
        catch (error) {
            return thunkAPI.rejectWithValue(error);
        }
    }
);

export {
    getAll,
    createSocketInstance,
    sendMessageSocket,
    toggleUserTypingSocket,
    connectSocket,
    disconnectSocket
};
