import {createAsyncThunk} from "@reduxjs/toolkit";
// own modules
import {AuthService} from "../../services/Auth.service.ts";
import {createRoute} from "../../router/createRoute.ts";
import {ROUTES} from "../../router/routes.ts";
import {router} from "../../router";
// types
import type {IUserAuth, TLoginFormData} from "../../models/IStore/IAuthentication.ts";
import {getAll as getAllUsers} from "./users.ts";
import {setUserId} from "../actions/chats.ts";

const login = createAsyncThunk(
    "authentication/login",
    async ({email, password}: TLoginFormData, thunkAPI) => {
        try {
            const response = await AuthService.login(email, password);
            // void thunkAPI.dispatch(getAllChats());
            void thunkAPI.dispatch(getAllUsers());
            localStorage.setItem("token", response.data.accessToken);
            void router.navigate(createRoute({path: ROUTES.MAIN}));
            return response.data;
        }
        catch (error) {
            return thunkAPI.rejectWithValue(error);
        }
    }
);

const logout = createAsyncThunk(
    "authentication/logout",
    async (_, thunkAPI) => {
        try {
            const response = await AuthService.logout();
            void router.navigate(createRoute({path: ROUTES.AUTH}));
            return response.data;
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

const checkAuthentication = createAsyncThunk(
    "authentication/check-authentication",
    async (_, thunkAPI) => {
        try {
            const response = await AuthService.refreshToken();

            // void thunkAPI.dispatch(getAllChats());
            void thunkAPI.dispatch(getAllUsers());
            void thunkAPI.dispatch(setUserId(response.data.user.id));
            localStorage.setItem("token", response.data.accessToken);
            void router.navigate(createRoute({path: ROUTES.MAIN}));
            return response.data;
        }
        catch (error) {
            localStorage.removeItem("token");
            return thunkAPI.rejectWithValue(error);
        }
    }
);

export {login, logout, registration, checkAuthentication};