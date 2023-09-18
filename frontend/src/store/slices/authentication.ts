import {createSlice} from "@reduxjs/toolkit";
// actions
import {login, registration, logout, checkAuthentication} from "../thunks/authentication";
// types
import type {IAuthentication} from "../../models/IStore/IAuthentication.ts";

const initialState: IAuthentication = {
    user: null,
    isAuthenticated: false
};

const authentication = createSlice({
    name: "authentication",
    initialState,
    reducers: {},
    extraReducers: builder => {
        builder
            .addCase(login.fulfilled, (state, action) => {
                state.isAuthenticated = true;
                state.user = action.payload.user;
            })
            .addCase(logout.fulfilled, (state) => {
                state.isAuthenticated = false;
                state.user = null;
            })
            .addCase(registration.fulfilled, (state, action) => {
                state.isAuthenticated = true;
                state.user = action.payload.user;
            })
            .addCase(checkAuthentication.fulfilled, (state, action) => {
                state.user = action.payload.user;
            });
    }
});

const {reducer} = authentication;

export default reducer;