import {Room} from "@prisma/client";
import {IMessage} from "../message/TMessage";

export interface IRoom extends Room {
    messages: IMessage[]
}