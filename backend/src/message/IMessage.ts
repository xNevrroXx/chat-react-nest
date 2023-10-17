import {TUserDto} from "../user/IUser";
import {TValueOf} from "../models/TUtils";
import {Prisma} from "@prisma/client";
import {TFileToClient} from "../file/IFile";

export type TChats = IChat[];

export interface IChat {
    userId: TValueOf<Pick<TUserDto, "id">>;
    isTyping: boolean;
    messages: TMessages;
}

export type TMessages = ( TMessage | TForwardMessage )[];

export type TMessage = Omit<Prisma.MessageGetPayload<{
    include: {
        files: true,
        replyToMessage: {
            include: {
                files: true
            }
        }
    }
}>, "forwardedMessageId"> & { files: TFileToClient[] };

export type TForwardMessage = Omit<Prisma.MessageGetPayload<{
    include: {
        forwardedMessage: {
            include: {
                files: true,
                replyToMessage: {
                    include: {
                        files: true
                    }
                }
            }
        }
    }
}>, "replyToMessageId">;

export function isForwardedMessage(obj: TMessage | TForwardMessage): obj is TForwardMessage {
    return (obj as TForwardMessage).forwardedMessage && (obj as TForwardMessage).forwardedMessage !== null;
}