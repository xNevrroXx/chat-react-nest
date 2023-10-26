import {createAction} from "@reduxjs/toolkit";
import {
    TForwardedMessageFromSocket,
    TMessageFromSocket,
    IParticipant, IEditedMessageFromSocket
} from "../../models/IStore/IChats.ts";
import {TValueOf} from "../../models/TUtils.ts";
import {IUserDto} from "../../models/IStore/IAuthentication.ts";

const setUserId = createAction<TValueOf<Pick<IUserDto, "id">>>("chat/set-user-id");

const handleMessageSocket = createAction<TMessageFromSocket>("chat/socket:handle-message");
const handleForwardedMessageSocket = createAction<TForwardedMessageFromSocket>("chat/socket:handle-forwarded-message");
const handleEditedMessageSocket = createAction<IEditedMessageFromSocket>("chat/socket:handle-edited-message");
const handleUserToggleTypingSocket = createAction<IParticipant[]>("chat/socket:handle-toggle-typing");

export {
    setUserId,
    handleMessageSocket,
    handleEditedMessageSocket,
    handleForwardedMessageSocket,
    handleUserToggleTypingSocket
};