import {IMessage} from "../../models/IStore/IChats.ts";
import {createAction} from "@reduxjs/toolkit";
import {TValueOf} from "../../models/TUtils.ts";
import {IUserDto} from "../../models/IStore/IAuthentication.ts";

const setUserId = createAction<TValueOf<Pick<IUserDto, "id">>>("chats/set-user-id");
const handleMessageSocket = createAction<IMessage>("chats/socket-handle-message");

export {setUserId, handleMessageSocket};