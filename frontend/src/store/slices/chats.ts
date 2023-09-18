import {createSlice} from "@reduxjs/toolkit";
// interfaces
import type {IChats} from "../../models/IStore/IChats.ts";
// actions
import {getAll} from "../thunks/chats.ts";
import {handleMessageSocket, setUserId} from "../actions/chats.ts";


const initialState: IChats = {
    userId: "",
    chats: []
};

const chats = createSlice({
    name: "chats",
    initialState,
    reducers: {},
    extraReducers: builder => {
        builder
            .addCase(setUserId, (state, action) => {
                state.userId = action.payload;
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
                state.chats = action.payload.chats;
            });
    }
});

const {reducer} = chats;

export default reducer;