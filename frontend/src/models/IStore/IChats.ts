import {IUserDto} from "./IAuthentication.ts";
import {TValueOf} from "../TUtils.ts";
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
    text: string | null,
    files: TFile[],

    createdAt: number;
    updatedAt?: number;
}

export type TFile = {
    id: string,
    createdAt: number,
    originalName: string,
    fileType: TFileType,
    mimeType: string,
    extension: string;
    blob: Blob;
}

export interface IFileForRender extends TFile {
    blobUrl: string
}

export interface IChatHTTPResponse  {
    userId: TValueOf<Pick<IUserDto, "id">>,
    messages: TMessageHTTPResponse[]
}

export type TMessageHTTPResponse = Omit<IMessage, "files"> & {
    files: TFileHTTPResponse[]
}


type TFileHTTPResponse = Omit<TFile, "buffer"> & {
    buffer: {
        type: "Buffer",
        data: number[]
    }
}

export type TMessageFromSocket = Omit<IMessage, "files"> & {
    files: TFileFromSocket[]
}


type TFileFromSocket = Omit<TFile, "buffer"> & {
    buffer: ArrayBuffer
}

export enum TFileType {
    VOICE_RECORD = "VOICE_RECORD",
    VIDEO_RECORD = "VIDEO_RECORD",
    ATTACHMENT = "ATTACHMENT"
}

export type TSendMessage = {
    interlocutorId: TValueOf<Pick<IUserDto, "id">>;
    text: TValueOf<Pick<IMessage, "text">>;
} & ISendAttachments;

export interface ISendAttachments {
    attachments: IAttachment[]
}

export interface IAttachment {
    originalName: string,
    fileType: TFileType,
    mimeType: string,
    extension: string;
    buffer: ArrayBuffer;
}