import {Room, RoomType} from "@prisma/client";
import {IMessage} from "../message/TMessage";

export interface IRoom extends Room {
    messages: IMessage[],
    pinnedMessages: {
        id: string,
        messageId: string
        text: string
    }[]
}

export type TPreviewRooms = {id: string, name: string, type: RoomType};