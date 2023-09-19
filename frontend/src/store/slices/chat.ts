import {createSlice} from "@reduxjs/toolkit";
// interfaces
import type {IChats} from "../../models/IStore/IChats.ts";
// actions
import {createSocket, getAll} from "../thunks/chat.ts";
import {handleMessageSocket, setUserId} from "../actions/chat.ts";


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
            .addCase(createSocket.fulfilled, (state, action) => {
                // @ts-ignore
                state.socket = action.payload;
            })
            .addCase(handleMessageSocket, (state, action) => {
                console.log("HANDLE MESSAGE ACTION: ", action);
                const interlocutorId = state.userId === action.payload.senderId ? action.payload.recipientId : action.payload.senderId;

                const targetChat = state.chats.find(chat => chat.userId === interlocutorId);
                if (!targetChat) {
                    state.chats.push({
                        userId: interlocutorId,
                        messages: [action.payload]
                    });
                    return;
                }

                targetChat.messages.push(action.payload);
            })
            .addCase(getAll.fulfilled, (state, action) => {
                state.chats = action.payload;
            });
    }
});

const {reducer} = chat;

export default reducer;