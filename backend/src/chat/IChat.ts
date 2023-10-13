import {TUserDto} from "../user/IUser";
import {TValueOf} from "../models/TUtils";
import {Message, File, UserTyping} from "@prisma/client";

export interface INewVoiceMessage {
    interlocutorId: TValueOf<Pick<TUserDto, "id">>;
    blob: ArrayBuffer;
}

export type TNewMessage = {
    interlocutorId: TValueOf<Pick<TUserDto, "id">>;
    text: TValueOf<Pick<Message, "text">>;
} & IGetAttachments

export interface IGetAttachments {
    attachments: IAttachment[]
}

export interface IAttachment extends Omit<File, "id" | "messageId" | "createdAt" | "fileName"> {
    buffer: ArrayBuffer;
}

export type TToggleUserTypingMessage = Pick<UserTyping, "userTargetId" | "isTyping">;

export interface IUserIdToSocketId {
    [userId: string]: string
}

export function exhaustiveCheck(data: never): never {
    throw new Error("Didn't expect to get here");
}