import {createAsyncThunk} from "@reduxjs/toolkit";
// services
import {ChatService} from "../../services/Chat.service.ts";
import {SocketIOService} from "../../services/SocketIO.service.ts";
// actions
import {handleMessageSocket} from "../actions/chats.ts";
// types
import {ISendMessage} from "../../models/IStore/IChats.ts";



const connectSocket = createAsyncThunk(
    "chats/socket-connect",
    async(_, thunkApi) => {
        try {
            await SocketIOService.connect();

            SocketIOService.on("message", (data) => {
                thunkApi.dispatch(handleMessageSocket(data));
            });
        }
        catch (error) {
            thunkApi.rejectWithValue(error);
        }
    }
);

const disconnectSocket = createAsyncThunk(
    "chats/socket-disconnect",
    async(_, thunkApi) => {
        try {
            await SocketIOService.disconnect();
            return;
        }
        catch (error) {
            thunkApi.rejectWithValue(error);
        }
    }
);

const sendMessageSocket = createAsyncThunk(
    "chats/socket-send-message",
    (data: ISendMessage, thunkAPI) => {
        try {
            SocketIOService.emit("message", [data]);
            return;
        }
        catch (error) {
            thunkAPI.rejectWithValue(error);
        }
    }
);

const getAll = createAsyncThunk(
    "chats/get-all",
    async(_, thunkAPI) => {
        try {
            const response = await ChatService.getAll();
            return response.data;
        }
        catch (error) {
            return thunkAPI.rejectWithValue(error);
        }
    }
);

export {getAll, sendMessageSocket, connectSocket, disconnectSocket};
