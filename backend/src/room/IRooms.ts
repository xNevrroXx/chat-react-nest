import {Room} from "@prisma/client";
import {IMessage} from "../message/IMessage";

export interface IRoom extends Room {
    messages: IMessage[]
}