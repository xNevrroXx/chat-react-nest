import {createSelector} from "@reduxjs/toolkit";
import {RootState} from "../index.ts";
import {IUserDto} from "../../models/IStore/IAuthentication.ts";
import {IChat} from "../../models/IStore/IChats.ts";

export type TUserDialogs = Map<IUserDto, IChat | null>;

export const userDialogsSelector = createSelector(
    [
        (state: RootState) => state.users.users,
        (state: RootState) => state.chats.chats
    ],
    (users, chats): [TUserDialogs, IUserDto] => {
        const userDialogs: TUserDialogs = new Map();

        users.forEach(user => {
           const foundChat = chats.find(chat => user.id === chat.userId);

           userDialogs.set(user, foundChat || null);
        });

        return [userDialogs, users[0]];
    }
);