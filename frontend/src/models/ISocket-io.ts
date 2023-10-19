import {
    TSendMessage,
    TMessageFromSocket,
    IUserTyping,
    TForwardMessage,
    TForwardedMessageFromSocket,
    TSendUserTyping
} from "./IStore/IChats.ts";
import {TUserOnlineHTTP} from "./IStore/IAuthentication.ts";

export interface ServerToClientEvents {
    "message": (data: TMessageFromSocket) => void;
    "message:forwarded": (data: TForwardedMessageFromSocket) => void;
    "user:toggle-online": (data: TUserOnlineHTTP) => void;
    "user:toggle-typing": (data: IUserTyping) => void;
}

export interface ClientToServerEvents {
    "message": (data: TSendMessage) => void;
    "message:forward": (data: TForwardMessage) => void;
    "user:toggle-typing": (data: TSendUserTyping) => void;
}