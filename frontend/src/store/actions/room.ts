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

const setUserId = createAction<TValueOf<Pick<IUserDto, "id">>>("chat/set-user-id");
const handleMessageSocket = createAction<IMessageSocket>("chat/socket:room:handle-message");
const handlePinnedMessageSocket = createAction<TPinnedMessagesSocket>("chat/socket:room:handle-pinned-message");
const handleEditedMessageSocket = createAction<IEditedMessageSocket>("chat/socket:room:handle-edited-message");
const handleDeletedMessageSocket = createAction<IDeletedMessageSocket>("chat/socket:room:handle-deleted-message");
const handleForwardedMessageSocket = createAction<IForwardedMessageSocket>("chat/socket:room:handle-forwarded-message");
const handleChangeUserTypingSocket = createAction<IParticipant[]>("chat/socket:room:handle-toggle-typing");

export {
    setUserId,
    handleMessageSocket,
    handlePinnedMessageSocket,
    handleEditedMessageSocket,
    handleDeletedMessageSocket,
    handleForwardedMessageSocket,
    handleChangeUserTypingSocket
};