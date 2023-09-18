import {IMessage, ISendMessage} from "./IStore/IChats.ts";

export interface ServerToClientEvents {
    message: (data: IMessage) => void
}

export interface ClientToServerEvents {
    message: (data: ISendMessage) => void;
    test: (testData: {a: string}) => void
}

export interface SocketData {
    name: string;
    age: number;
}