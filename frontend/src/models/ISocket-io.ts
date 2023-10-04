import {IMessage, ISendMessage, ISendVoiceMessage} from "./IStore/IChats.ts";

export interface ServerToClientEvents {
    message: (data: IMessage) => void
}

export interface ClientToServerEvents {
    message: (data: ISendMessage) => void;
    voiceMessage: (data: ISendVoiceMessage) => void;
}

export interface SocketData {
    name: string;
    age: number;
}