import {createAsyncThunk} from "@reduxjs/toolkit";
// own modules
import {UsersService} from "../../services/Users.service.ts";
import {UserDto, UserOnline} from "../../models/IStore/IAuthentication.ts";
import {RootState} from "../index.ts";


const getAll = createAsyncThunk<UserDto[], void, {state: RootState}>(
    "users/get-all",
    async (_, thunkAPI) => {
        try {
            const response = await UsersService.getAll();

            return response.data.users.map<UserDto>(user => {
                const userOnline = new UserOnline({
                    ...user.userOnline,
                    updatedAt: new Date(user.userOnline.updatedAt)
                });

                return new UserDto({
                    ...user,
                    createdAt: new Date(user.createdAt),
                    updatedAt: new Date(user.updatedAt),
                    userOnline: userOnline
                });
            });
        } catch (error) {
            return thunkAPI.rejectWithValue(error);
        }
    }
);

export {getAll};