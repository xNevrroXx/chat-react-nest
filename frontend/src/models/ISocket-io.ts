import {TSendMessage, TMessageFromSocket} from "./IStore/IChats.ts";

export interface ServerToClientEvents {
    message: (data: TMessageFromSocket) => void
}

export interface ClientToServerEvents {
    message: (data: TSendMessage) => void;
}

export interface SocketData {
    name: string;
    age: number;
}