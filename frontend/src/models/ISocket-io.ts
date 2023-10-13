import {TSendMessage, TMessageFromSocket, TUserTyping} from "./IStore/IChats.ts";
import {TUserOnline} from "./IStore/IUsers.ts";

export interface ServerToClientEvents {
    "message": (data: TMessageFromSocket) => void;
    "user:toggle-online": (data: TUserOnline) => void;
    "user:toggle-typing": (data: TUserTyping) => void;
}

export interface ClientToServerEvents {
    "message": (data: TSendMessage) => void;
    "user:toggle-typing": (data: TUserTyping) => void;
}