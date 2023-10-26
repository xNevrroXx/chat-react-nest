import {
    TSendMessage,
    TMessageFromSocket,
    TForwardMessage,
    TForwardedMessageFromSocket,
    TSendUserTyping,
    IParticipant, IEditMessage, IEditedMessageFromSocket
} from "./IStore/IChats.ts";
import {TUserOnlineHTTP} from "./IStore/IAuthentication.ts";

export interface ServerToClientEvents {
    "message": (data: TMessageFromSocket) => void;
    "message:edited": (data: IEditedMessageFromSocket) => void;
    "message:forwarded": (data: TForwardedMessageFromSocket) => void;
    "user:toggle-online": (data: TUserOnlineHTTP) => void;
    "room:toggle-typing": (data: IParticipant[]) => void;
}

export interface ClientToServerEvents {
    "message": (data: TSendMessage) => void;
    "message:edit": (data: IEditMessage) => void;
    "message:forward": (data: TForwardMessage) => void;
    "user:toggle-typing": (data: TSendUserTyping) => void;
}