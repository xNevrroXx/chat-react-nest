import {createSlice} from "@reduxjs/toolkit";
// interfaces
import type {IChats, TFile} from "../../models/IStore/IChats.ts";
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
                const interlocutorId = state.userId === action.payload.senderId ? action.payload.recipientId : action.payload.senderId;

                const targetChat = state.chats.find(chat => chat.userId === interlocutorId);
                const files: TFile[] = action.payload.files.map(file => {
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
                const newMessage = {
                    ...action.payload,
                    files
                };

                if (!targetChat) {
                    state.chats.push({
                        userId: interlocutorId,
                        messages: [newMessage]
                    });
                    return;
                }

                targetChat.messages.push(newMessage);
            })
            .addCase(getAll.fulfilled, (state, action) => {
                state.chats = action.payload;
            });
    }
});

const {reducer} = chat;

export default reducer;