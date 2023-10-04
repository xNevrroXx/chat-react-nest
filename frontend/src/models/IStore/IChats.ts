import {IUserDto} from "./IAuthentication.ts";
import {TOneOf, TValueOf} from "../TUtils.ts";
import {SocketIOService} from "../../services/SocketIO.service.ts";

export interface IChats {
    userId: TValueOf<Pick<IUserDto, "id">>;
    chats: IChat[];
    socket: InstanceType<typeof SocketIOService> | null;
}

export interface IChat {
    userId: TValueOf<Pick<IUserDto, "id">>,
    messages: IMessage[]
}

export interface IMessage {
    id: string,
    senderId: TValueOf<Pick<IUserDto, "id">>,
    recipientId: TValueOf<Pick<IUserDto, "id">>,
    hasRead: boolean,
    text?: string,
    files: IFile[],

    createdAt: number;
    updatedAt?: number;
}

export interface IFile {
    id: string,
    createdAt: number,
    type: keyof TFileType,
    blob: Blob
}

export interface IChatHTTPResponse  {
    userId: TValueOf<Pick<IUserDto, "id">>,
    messages: TMessageHTTPResponse[]
}

export type TMessageHTTPResponse = Omit<IMessage, "files"> & {
    files: TFileHTTPResponse[]
}


type TFileHTTPResponse = Omit<IFile, "buffer"> & {
    buffer: {
        type: "Buffer",
        data: number[]
    }
}

export type TMessageFromSocket = Omit<IMessage, "files"> & {
    files: TFileFromSocket[]
}


type TFileFromSocket = Omit<IFile, "buffer"> & {
    buffer: ArrayBuffer
}

export enum TFileType {
    TEXT,
    AUDIO,
    VIDEO,
    VOICE,
    OTHER
}


export type TMessageType = TOneOf<{
    TEXT: string | null,
    AUDIO: string | null,
    VIDEO: string | null
}>;

export interface ISendMessage {
    interlocutorId: TValueOf<Pick<IUserDto, "id">>;
    text: TValueOf<Pick<IMessage, "text">>;
}

export interface ISendVoiceMessage {
    interlocutorId: TValueOf<Pick<IUserDto, "id">>;
    blob: Blob;
}