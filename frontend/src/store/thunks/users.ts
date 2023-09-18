import {createAsyncThunk} from "@reduxjs/toolkit";
// own modules
import {UsersService} from "../../services/Users.service.ts";


const getAll = createAsyncThunk(
    "users/get-all",
    async (_, thunkApi) => {
        try {
            const response = await UsersService.getAll();
            return response.data;
        } catch (error) {
            thunkApi.rejectWithValue(error);
        }
    }
);

export {getAll};