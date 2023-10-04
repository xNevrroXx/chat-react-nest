import {TUserDto} from "../user/IUser";
import {TValueOf} from "../models/TUtils";
import {Message} from "@prisma/client";

export interface INewMessage {
    interlocutorId: TValueOf<Pick<TUserDto, "id">>;
    text: TValueOf<Pick<Message, "text">>;
}

export interface INewVoiceMessage {
    interlocutorId: TValueOf<Pick<TUserDto, "id">>;
    blob: ArrayBuffer;
}

export interface IUserIdToSocketId {
    [userId: string]: string
}