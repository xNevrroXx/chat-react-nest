import {TNewMessage} from "./IChat";

export interface ServerToClientEvents {
    message: (data: TNewMessage) => void
}

export interface ClientToServerEvents {
    message: (data: TNewMessage) => void
}