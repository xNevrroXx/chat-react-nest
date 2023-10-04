import {ISendMessage, ISendVoiceMessage, TMessageFromSocket} from "./IStore/IChats.ts";

export interface ServerToClientEvents {
    message: (data: TMessageFromSocket) => void
    voiceMessage: (data: TMessageFromSocket) => void
}

export interface ClientToServerEvents {
    message: (data: ISendMessage) => void;
    voiceMessage: (data: ISendVoiceMessage) => void;
}

export interface SocketData {
    name: string;
    age: number;
}