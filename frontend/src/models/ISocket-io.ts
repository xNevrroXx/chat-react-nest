import {
    TSendMessage,
    TMessageFromSocket,
    TUserTyping,
    TForwardMessage,
    TForwardedMessageFromSocket
} from "./IStore/IChats.ts";
import {TUserOnlineHTTP} from "./IStore/IAuthentication.ts";

export interface ServerToClientEvents {
    "message": (data: TMessageFromSocket) => void;
    "message:forwarded": (data: TForwardedMessageFromSocket) => void;
    "user:toggle-online": (data: TUserOnlineHTTP) => void;
    "user:toggle-typing": (data: TUserTyping) => void;
}

export interface ClientToServerEvents {
    "message": (data: TSendMessage) => void;
    "message:forward": (data: TForwardMessage) => void;
    "user:toggle-typing": (data: TUserTyping) => void;
}