import {createAsyncThunk} from "@reduxjs/toolkit";
// own modules
import {AuthService} from "../../services/Auth.service.ts";
import {createRoute} from "../../router/createRoute.ts";
import {ROUTES} from "../../router/routes.ts";
import {router} from "../../router";
// actions
import {getAll as getAllUsers} from "./users.ts";
import {setUserId} from "../actions/chat.ts";
// types
import type {IUserAuth, TLoginFormData} from "../../models/IStore/IAuthentication.ts";
import {connectSocket, createSocket, disconnectSocket, getAll as getAllChats} from "./chat.ts";
import {IAuthResponse} from "../../models/IResponse/IAuthResponse.ts";
import {RootState} from "../index.ts";

const login = createAsyncThunk<IAuthResponse, TLoginFormData, {state: RootState}>(
    "authentication/login",
    async ({email, password}: TLoginFormData, thunkAPI) => {
        try {
            const response = await AuthService.login(email, password);
            localStorage.setItem("token", response.data.accessToken);

            const dispatch = thunkAPI.dispatch;
            void dispatch(setUserId(response.data.user.id));
            void dispatch(getAllUsers());
            void dispatch(getAllChats());
            await dispatch(createSocket(response.data.accessToken));
            void dispatch(connectSocket());
            void router.navigate(createRoute({path: ROUTES.MAIN}));
            return response.data;
        }
        catch (error) {
            return thunkAPI.rejectWithValue(error);
        }
    }
);

const logout = createAsyncThunk<void, void, {state: RootState}>(
    "authentication/logout",
    async (_, thunkAPI) => {
        try {
            await AuthService.logout();
            await thunkAPI.dispatch(disconnectSocket());
            void router.navigate(createRoute({path: ROUTES.AUTH}));
        }
        catch (error) {
            return thunkAPI.rejectWithValue(error);
        }
    }
);

const registration = createAsyncThunk(
    "authentication/registration",
    async ({email, name, surname, password, sex, age}: IUserAuth, thunkAPI) => {
        try {
            const response = await AuthService.registration({email, name, surname, password, sex, age});
            localStorage.setItem("token", response.data.accessToken);
            void router.navigate(createRoute({path: ROUTES.MAIN}));
            return response.data;
        }
        catch (error) {
            return thunkAPI.rejectWithValue(error);
        }
    }
);

const checkAuthentication = createAsyncThunk<IAuthResponse, void, {state: RootState}>(
    "authentication/check-authentication",
async (_, thunkAPI) => {
    try {
        const response = await AuthService.refreshToken();
        localStorage.setItem("token", response.data.accessToken);

        const dispatch = thunkAPI.dispatch;
        void dispatch(setUserId(response.data.user.id));
        void dispatch(getAllUsers());
        void dispatch(getAllChats());
        await dispatch(createSocket(response.data.accessToken));
        void dispatch(connectSocket());
        void router.navigate(createRoute({path: ROUTES.MAIN}));
        return response.data;
    }
    catch (error) {
        localStorage.removeItem("token");
        void router.navigate(createRoute({path: ROUTES.AUTH}));
        return thunkAPI.rejectWithValue(error);
    }

});

export {login, logout, registration, checkAuthentication};