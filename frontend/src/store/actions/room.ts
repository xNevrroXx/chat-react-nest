import {createAction} from "@reduxjs/toolkit";
import {
    IParticipant,
    IMessageSocket,
    IEditedMessageSocket,
    IDeletedMessageSocket,
    TPinnedMessagesSocket,
    IForwardedMessageSocket
} from "../../models/IStore/IRoom.ts";
import {TValueOf} from "../../models/TUtils.ts";
import {IUserDto} from "../../models/IStore/IAuthentication.ts";

const setUserId = createAction<TValueOf<Pick<IUserDto, "id">>>("room/set-user-id");
const handleMessageSocket = createAction<IMessageSocket>("room/socket:handle-message");
const handlePinnedMessageSocket = createAction<TPinnedMessagesSocket>("room/socket:handle-pinned-message");
const handleEditedMessageSocket = createAction<IEditedMessageSocket>("room/socket:handle-edited-message");
const handleDeletedMessageSocket = createAction<IDeletedMessageSocket>("room/socket:handle-deleted-message");
const handleForwardedMessageSocket = createAction<IForwardedMessageSocket>("room/socket:handle-forwarded-message");
const handleChangeUserTypingSocket = createAction<IParticipant[]>("room/socket:room:handle-toggle-typing");

export {
    setUserId,
    handleMessageSocket,
    handlePinnedMessageSocket,
    handleEditedMessageSocket,
    handleDeletedMessageSocket,
    handleForwardedMessageSocket,
    handleChangeUserTypingSocket
};