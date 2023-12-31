import {createSelector} from "@reduxjs/toolkit";
import {RootState} from "../index.ts";
import {
    IForwardedMessage,
    IInnerForwardedMessage,
    IInnerMessage,
    IMessage,
} from "../../models/IStore/IRoom.ts";
import {IUserDto} from "../../models/IStore/IAuthentication.ts";

const messageOwnerSelector = createSelector(
    [
        (state: RootState) => state.authentication.user,
        (state: RootState) => state.users.users,
        (_, message: IMessage | IForwardedMessage | IInnerMessage | IInnerForwardedMessage) => message
    ],
    (user, users, message): IUserDto | undefined => {
        const senderId = message.senderId;
        if (user && user.id === senderId) {
            return user;
        }
        return users.find(user => user.id === senderId);
    }
);

export {messageOwnerSelector};