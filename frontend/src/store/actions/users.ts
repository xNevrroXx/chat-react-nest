import {createAction} from "@reduxjs/toolkit";
import {TUserOnline} from "../../models/IStore/IUsers.ts";

const handleUserChangeOnlineSocket = createAction<TUserOnline>("users/socket:user:change-online");

export {handleUserChangeOnlineSocket};