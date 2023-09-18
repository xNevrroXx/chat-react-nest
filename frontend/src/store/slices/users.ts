import {createSlice} from "@reduxjs/toolkit";
// actions
import {getAll} from "../thunks/users.ts";
// types
import type {IUsers} from "../../models/IStore/IUsers.ts";


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
                state.users = action.payload!.users;
            });
    }
});

const {reducer} = users;

export default reducer;