import {createAsyncThunk} from "@reduxjs/toolkit";
// own modules
import {UsersService} from "../../services/Users.service.ts";
import {RootState} from "../index.ts";
import {TUsersResponse} from "../../models/IResponse/IUsersResponse.ts";


const getAll = createAsyncThunk<TUsersResponse, void, {state: RootState}>(
    "users/get-all",
    async (_, thunkAPI) => {
        try {
            const response = await UsersService.getAll();
            return response.data;
        } catch (error) {
            return thunkAPI.rejectWithValue(error);
        }
    }
);

export {getAll};