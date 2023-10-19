import {createSelector} from "@reduxjs/toolkit";
import {RootState} from "../index.ts";
import {UserDto} from "../../models/IStore/IAuthentication.ts";
import {IRoom} from "../../models/IStore/IChats.ts";

export type TUserDialogs = IRoom;

export const userDialogsSelector = createSelector(
    [
        (state: RootState) => state.users.users,
        (state: RootState) => state.chat.chats
    ],
    (users, chats): [IRoom[], UserDto[]] => {
        
        return [chats, users];
    }
);