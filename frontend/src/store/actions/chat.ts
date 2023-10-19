import {createAction} from "@reduxjs/toolkit";
import {TForwardedMessageFromSocket, TMessageFromSocket, IUserTyping} from "../../models/IStore/IChats.ts";
import {TValueOf} from "../../models/TUtils.ts";
import {IUserDto} from "../../models/IStore/IAuthentication.ts";

const setUserId = createAction<TValueOf<Pick<IUserDto, "id">>>("chat/set-user-id");

const handleMessageSocket = createAction<TMessageFromSocket>("chat/socket:handle-message");
const handleForwardedMessageSocket = createAction<TForwardedMessageFromSocket>("chat/socket:handle-forwarded-message");
const handleUserToggleTypingSocket = createAction<IUserTyping>("chat/socket:handle-toggle-typing");

export {
    setUserId,
    handleMessageSocket,
    handleForwardedMessageSocket,
    handleUserToggleTypingSocket
};