import {
    TSendMessage,
    IMessageSocket,
    IForwardMessage,
    IForwardedMessageSocket,
    TSendUserTyping,
    IParticipant,
    IPinMessage,
    IEditMessage,
    IDeleteMessage,
    IEditedMessageSocket,
    IDeletedMessageSocket,
    TPinnedMessagesSocket
} from "./IStore/IChats.ts";
import {TUserOnline} from "./IStore/IAuthentication.ts";

export interface ServerToClientEvents {
    "message": (data: IMessageSocket) => void;
    "message:pinned": (data: TPinnedMessagesSocket) => void;
    "message:edited": (data: IEditedMessageSocket) => void;
    "message:deleted": (data: IDeletedMessageSocket) => void;
    "message:forwarded": (data: IForwardedMessageSocket) => void;
    "user:toggle-online": (data: TUserOnline) => void;
    "room:toggle-typing": (data: IParticipant[]) => void;
}

export interface ClientToServerEvents {
    "message": (data: TSendMessage) => void;
    "message:pin": (data: IPinMessage) => void;
    "message:edit": (data: IEditMessage) => void;
    "message:delete": (data: IDeleteMessage) => void;
    "message:forward": (data: IForwardMessage) => void;
    "user:toggle-typing": (data: TSendUserTyping) => void;
}