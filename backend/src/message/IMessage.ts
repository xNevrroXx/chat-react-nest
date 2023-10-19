import {TUserDto} from "../user/IUser";
import {TValueOf} from "../models/TUtils";
import {Prisma} from "@prisma/client";
import {TFileToClient} from "../file/IFile";
import {IRoom} from "../room/IRooms";

export interface IChat {
    userId: TValueOf<Pick<TUserDto, "id">>;
    rooms: IRoom[];
}

export type IMessage = ( TMessage | TForwardMessage );
export type TMessage = Omit<TMessageWithoutFileBlobs, "forwardedMessageId"> & { files: TFileToClient[] };
export type TForwardMessage = Omit<TForwardMessageWithoutFileBlobs, "replyToMessageId">;

export type TMessageWithoutFileBlobs = Prisma.MessageGetPayload<{
    include: {
        files: true,
        replyToMessage: {
            include: {
                files: true
            }
        }
    }
}>;

export type TForwardMessageWithoutFileBlobs = Prisma.MessageGetPayload<{
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
}>;

export function isForwardedMessage(obj: TMessageWithoutFileBlobs | TForwardMessageWithoutFileBlobs): obj is TForwardMessageWithoutFileBlobs {
    return (obj as TForwardMessageWithoutFileBlobs).forwardedMessage && (obj as TForwardMessageWithoutFileBlobs).forwardedMessage !== null;
}