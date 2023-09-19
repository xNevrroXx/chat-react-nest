import {IUserDto} from "./IAuthentication.ts";
import {TOneOf, TValueOf} from "../TUtils.ts";
import {SocketIOService} from "../../services/SocketIO.service.ts";

export interface IChats {
    userId: TValueOf<Pick<IUserDto, "id">>;
    chats: IChat[];
    socket: InstanceType<typeof SocketIOService> | null;
}

export interface IMessage {
    id: string,
    senderId: TValueOf<Pick<IUserDto, "id">>,
    recipientId: TValueOf<Pick<IUserDto, "id">>,
    hasRead: boolean
    type: keyof TMessageType,
    text: string,

    createdAt: number;
    updatedAt: number;
}

export interface IChat {
    userId: TValueOf<Pick<IUserDto, "id">>,
    messages: IMessage[]
}

export type TMessageType = TOneOf<{
    TEXT: string | null,
    AUDIO: string | null,
    VIDEO: string | null
}>;

export interface ISendMessage {
    interlocutorId: TValueOf<Pick<IUserDto, "id">>;
    type: TValueOf<Pick<IMessage, "type">>,
    text: TValueOf<Pick<IMessage, "text">>
}