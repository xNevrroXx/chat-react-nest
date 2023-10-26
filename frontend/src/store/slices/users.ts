import {createSlice} from "@reduxjs/toolkit";
// actions
import {getAll} from "../thunks/users.ts";
// types
import type {IUsers} from "../../models/IStore/IUsers.ts";
import {handleUserToggleOnlineSocket} from "../actions/users.ts";


const initialState: IUsers = {
    users: []
};

const users = createSlice({
    name: "users",
    initialState,
    reducers: {},
    extraReducers: builder => {
        builder
            .addCase(getAll.fulfilled, (state, action) => {
                state.users = action.payload.users;
            })
            .addCase(handleUserToggleOnlineSocket, (state, action) => {
                const targetUser = state.users.find(user => user.id === action.payload.userId);
                if (!targetUser) return;
                targetUser.userOnline = action.payload;
            });
    }
});

const {reducer} = users;

export default reducer;