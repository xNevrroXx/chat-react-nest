import {createAsyncThunk} from "@reduxjs/toolkit";
// services
import {ChatService} from "../../services/Chat.service.ts";
import {SocketIOService} from "../../services/SocketIO.service.ts";
// actions
import {handleMessageSocket} from "../actions/chat.ts";
// types
import {ISendMessage, ISendVoiceMessage} from "../../models/IStore/IChats.ts";
import {RootState} from "../index.ts";


const createSocket = createAsyncThunk<InstanceType<typeof SocketIOService> | undefined, string, {state: RootState}>(
    "chat/socket-create",
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
    "chat/socket-connect",
    async(_, thunkApi) => {
        try {
            const socket = thunkApi.getState().chat.socket;
            await socket?.connect();

            socket?.on("message", (data) => {
                thunkApi.dispatch(handleMessageSocket(data));
            });

            return;
        }
        catch (error) {
            thunkApi.rejectWithValue(error);
        }
    }
);

const disconnectSocket = createAsyncThunk<void, void, {state: RootState}>(
    "chat/socket-disconnect",
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

const sendMessageSocket = createAsyncThunk<void, ISendMessage, {state: RootState}>(
    "chat/socket-send-message",
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

const sendVoiceMessageSocket = createAsyncThunk<void, ISendVoiceMessage, {state: RootState}> (
    "chat/socket-send-voice-message",
    (data, thunkAPI) => {
        try {
            const socket = thunkAPI.getState().chat.socket;
            if (!socket) {
                throw new Error("There is no socket");
            }

            socket.emit("voiceMessage", [data]);
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
            console.log(response);
            return response.data;
        }
        catch (error) {
            return thunkAPI.rejectWithValue(error);
        }
    }
);

export {getAll, createSocket, sendMessageSocket, sendVoiceMessageSocket, connectSocket, disconnectSocket};
