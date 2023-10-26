import {
    TSendMessage,
    IMessageSocket,
    TForwardMessage,
    IForwardedMessageSocket,
    TSendUserTyping,
    IParticipant,
    IEditMessage,
    IEditedMessageSocket
} from "./IStore/IChats.ts";
import {TUserOnline} from "./IStore/IAuthentication.ts";

export interface ServerToClientEvents {
    "message": (data: IMessageSocket) => void;
    "message:edited": (data: IEditedMessageSocket) => void;
    "message:forwarded": (data: IForwardedMessageSocket) => void;
    "user:toggle-online": (data: TUserOnline) => void;
    "room:toggle-typing": (data: IParticipant[]) => void;
}

export interface ClientToServerEvents {
    "message": (data: TSendMessage) => void;
    "message:edit": (data: IEditMessage) => void;
    "message:forward": (data: TForwardMessage) => void;
    "user:toggle-typing": (data: TSendUserTyping) => void;
}