import {createAction} from "@reduxjs/toolkit";
import {TUserOnlineHTTP} from "../../models/IStore/IAuthentication.ts";

const handleUserToggleOnlineSocket = createAction<TUserOnlineHTTP>("users/socket:user:change-online");

export {handleUserToggleOnlineSocket};