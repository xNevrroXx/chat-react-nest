import {createAction} from "@reduxjs/toolkit";
import {TMessageFromSocket} from "../../models/IStore/IChats.ts";
import {TValueOf} from "../../models/TUtils.ts";
import {IUserDto} from "../../models/IStore/IAuthentication.ts";

const setUserId = createAction<TValueOf<Pick<IUserDto, "id">>>("chat/set-user-id");

const handleMessageSocket = createAction<TMessageFromSocket>("chat/socket-handle-message");

export {setUserId, handleMessageSocket};