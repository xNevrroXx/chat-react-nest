import {createAsyncThunk} from "@reduxjs/toolkit";
// own modules
import {UsersService} from "../../services/Users.service.ts";
import {TUserDtoHTTP, UserDto, UserOnline} from "../../models/IStore/IAuthentication.ts";
import {RootState} from "../index.ts";


const getAll = createAsyncThunk<UserDto[], void, {state: RootState}>(
    "users/get-all",
    async (_, thunkAPI) => {
        try {
            const response = await UsersService.getAll();

            return response.data.users.map<UserDto>((user: TUserDtoHTTP) => {
                let userOnline: UserOnline;
                if (user.userOnline) {
                    userOnline = new UserOnline({
                        ...user.userOnline,
                        updatedAt: user.userOnline.updatedAt ? new Date(user.userOnline.updatedAt) : undefined,
                    });
                }
                else {
                    userOnline = new UserOnline({
                        id: "",
                        userId: user.id,
                        isOnline: false,
                        updatedAt: undefined
                    });
                }

                return new UserDto({
                    ...user,
                    createdAt: new Date(user.createdAt),
                    updatedAt: user.updatedAt ? new Date(user.updatedAt) : undefined,
                    userOnline: userOnline
                });
            });
        } catch (error) {
            return thunkAPI.rejectWithValue(error);
        }
    }
);

export {getAll};