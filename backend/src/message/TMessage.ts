import {TUserDto} from "../user/IUser";
import {TValueOf} from "../models/TUtils";
import {FileType, Prisma, User} from "@prisma/client";
import {TFileToClient} from "../file/IFile";
import {IRoom} from "../room/IRooms";
import {ILinkPreviewInfo} from "../link-preview/ILinkPreview";

export interface IChat {
    userId: TValueOf<Pick<TUserDto, "id">>;
    rooms: IRoom[];
}

export type IMessage = ( TMessage | TForwardedMessage );

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

export type TNormalizeMessageArgument =
    Prisma.MessageGetPayload<{
        include: {
            files: true,
            replyToMessage: {
                include: {
                    files: true
                }
            },
            forwardedMessage: {
                include: {
                    files: true,
                    replyToMessage: {
                        include: {
                            files: true
                        }
                    }
                }
            },
            usersDeletedThisMessage: true
        }
    }>
    |
    Prisma.MessageGetPayload<{
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
            },
            usersDeletedThisMessage: true
        },
    }>
    |
    Prisma.MessageGetPayload<{
        include: {
            files: true,
            replyToMessage: {
                include: {
                    files: true
                }
            },
            usersDeletedThisMessage: true
        }
    }>;

export interface TMessage extends IInnerMessage {
    replyToMessage: IInnerMessage | IInnerForwardedMessage | undefined | null;
}

export interface TForwardedMessage extends IInnerForwardedMessage {
    forwardedMessage: IInnerMessage | IInnerForwardedMessage;
}


export interface IInnerMessage extends IOriginalMessage {
    files: TFileToClient[];
    replyToMessageId: TValueOf<Pick<TMessage, "id">> | undefined | null;
}

export interface IInnerForwardedMessage extends IOriginalMessage {
    forwardedMessageId: TValueOf<Pick<TMessage, "id">>;
}

export interface IOriginalMessage {
    id: string;
    roomId: TValueOf<Pick<IRoom, "id">>;
    senderId: TValueOf<Pick<User, "id">>;
    hasRead: boolean;
    links: string[];
    isDeleted: boolean;
    firstLinkInfo: ILinkPreviewInfo | undefined;
    text: string | undefined | null;

    createdAt: string;
    updatedAt: string | undefined | null;
}

export interface IFile {
    id: string,
    originalName: string,
    fileType: FileType,
    mimeType: string,
    extension: string;
    blob: Blob;

    createdAt: string,
}

export function isForwardedMessagePrisma(obj: TMessageWithoutFileBlobs | TForwardMessageWithoutFileBlobs): obj is TForwardMessageWithoutFileBlobs {
    return (obj as TForwardMessageWithoutFileBlobs).forwardedMessage && (obj as TForwardMessageWithoutFileBlobs).forwardedMessage !== null;
}

export function isForwardedMessage(obj: TMessage | TForwardedMessage): obj is TForwardedMessage {
    return !!(obj as TForwardedMessage).forwardedMessage && (obj as TForwardedMessage).forwardedMessage !== null;
}

export function isInnerForwardedMessage(obj: IInnerMessage | IInnerForwardedMessage): obj is IInnerForwardedMessage {
    return !!(obj as IInnerForwardedMessage).forwardedMessageId;
}

export function isInnerMessage(obj: IInnerMessage | IInnerForwardedMessage): obj is IInnerMessage {
    return !!(obj as IInnerMessage).files;
}