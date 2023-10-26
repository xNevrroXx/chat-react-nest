import {IUserDto} from "./IAuthentication.ts";
import {TValueOf} from "../TUtils.ts";
import {SocketIOService} from "../../services/SocketIO.service.ts";


export enum FileType {
    VOICE_RECORD = "VOICE_RECORD",
    VIDEO_RECORD = "VIDEO_RECORD",
    ATTACHMENT = "ATTACHMENT"
}

export enum RoomType {
    GROUP = "GROUP",
    PRIVATE = "PRIVATE"
}

// Store types
export interface IChats {
    userId: TValueOf<Pick<IUserDto, "id">>;
    chats: IRoom[];
    socket: SocketIOService | null;
}
export interface IRoom {
    id: string
    name: string,
    userId: TValueOf<Pick<IUserDto, "id">>,
    roomType: RoomType,
    creatorUser?: TValueOf<Pick<IUserDto, "id">>,
    // usersTyping: IUserTyping[],
    messages: (Message | ForwardedMessage)[],
    participants: IParticipant[]

    createdAt: Date,
    updatedAt: Date | undefined
}

export interface IParticipant {
    id: string,
    roomId: TValueOf<Pick<IRoom, "id">>,
    userId: TValueOf<Pick<IUserDto, "id">>,
    nickname: string,
    isOnline: boolean,
    isTyping: boolean
}

export interface IUserTyping {
    userId: TValueOf<Pick<IUserDto, "id">>,
    roomId: TValueOf<Pick<IRoom, "id">>,
    isTyping: boolean,
    updatedAt: string
}

export interface IMessage extends IInnerMessage {
    replyToMessage: InnerMessage | InnerForwardedMessage | null;
}

export interface IForwardedMessage extends IInnerForwardedMessage {
    forwardedMessage: InnerMessage | InnerForwardedMessage;
}


export interface IInnerMessage extends IOriginalMessage {
    files: Attachment[];
    replyToMessageId: TValueOf<Pick<IMessage, "id">> | null;
}

export interface IInnerForwardedMessage extends IOriginalMessage {
    forwardedMessageId: TValueOf<Pick<IMessage, "id">> | null;
}

export interface IOriginalMessage {
    id: string;
    roomId: TValueOf<Pick<IRoom, "id">>
    senderId: TValueOf<Pick<IUserDto, "id">>;
    hasRead: boolean;
    text: string | null;

    createdAt: Date;
    updatedAt: Date | null;
}

export type TFile = {
    id: string,
    originalName: string,
    fileType: FileType,
    mimeType: string,
    extension: string;
    blob: Blob;

    createdAt: Date,
}

export interface IFileForRender extends TFile {
    blobUrl: string
}

export type TAttachmentType = "video" | "audio" | "image" | "unknown";

export interface IKnownAndUnknownFiles {
    known: ( IFileForRender & {attachmentType: Exclude<TAttachmentType, "unknown">} )[],
    unknown: ( IFileForRender & {attachmentType: Extract<TAttachmentType, "unknown">} )[]
}


// Socket and HTTP response types
export type TOriginalMessageHTTP = Omit<IOriginalMessage, "createdAt" | "updatedAt"> & {
    createdAt: string;
    updatedAt: string | null;
}

export interface IInnerMessageHTTP extends TOriginalMessageHTTP {
    files: TFile[];
    replyToMessageId: TValueOf<Pick<IMessage, "id">> | null;
}

export type TRoomHTTP = Omit<IRoom, "messages"> & {
    messages: (TMessageHTTP | TForwardedMessageHTTP)[]
}

export type TMessageHTTP =
    Omit<TInnerMessageHTTPResponse, "files" | "replyToMessage">
    & { files: TFileHTTP[] }
    & { replyToMessage: TInnerMessageHTTPResponse | TInnerForwardedMessageHTTP | null }

export type TForwardedMessageHTTP =
    Omit<TInnerForwardedMessageHTTP, "forwardedMessage">
    & { forwardedMessage: TInnerMessageHTTPResponse | TInnerForwardedMessageHTTP | null }

export type TInnerMessageHTTPResponse =
    Omit<IInnerMessageHTTP, "files">
    & { files: TFileHTTP[] }

export type TInnerForwardedMessageHTTP =
    TOriginalMessageHTTP
    & { forwardedMessageId: TValueOf<Pick<IMessage, "id">> | null }

type TFileHTTP = Omit<TFile, "buffer" | "createdAt"> & {
    buffer: {
        type: "Buffer",
        data: number[]
    },
    createdAt: string
}

export type TInnerMessageFromSocket =
    Omit<IInnerMessage, "files">
    & { files: TFileFromSocket[] }

export type TMessageFromSocket =
    Omit<TMessageHTTP, "files">
    & { files: TFileFromSocket[] }
    & { replyToMessage: TInnerMessageFromSocket | IInnerForwardedMessage | null }

export type TForwardedMessageFromSocket =
    Omit<TForwardedMessageHTTP, "forwardedMessage">
    & { forwardedMessage: TInnerMessageFromSocket | IInnerForwardedMessage | null }

export interface IEditedMessageFromSocket {
    roomId: TValueOf<Pick<IRoom, "id">>,
    messageId: TValueOf<Pick<IOriginalMessage, "id">>,
    text: TValueOf<Pick<IOriginalMessage, "text">>
}

type TFileFromSocket = Omit<TFileHTTP, "buffer"> & {
    buffer: ArrayBuffer
}



// only client types(without responses) to send data
export type TSendUserTyping = Omit<IUserTyping, "updatedAt" | "userId">

export type TSendMessage = {
    roomId: TValueOf<Pick<IRoom, "id">>;
    text: TValueOf<Pick<IMessage, "text">>;
    replyToMessageId: TValueOf<Pick<IMessage, "id">> | null;
} & ISendAttachments;

export type TForwardMessage = {
    roomId: TValueOf<Pick<IRoom, "id">>;
    forwardedMessageId: TValueOf<Pick<IMessage, "id">>;
}

export interface ISendAttachments {
    attachments: IAttachment[]
}

export interface IAttachment {
    originalName: string,
    fileType: FileType,
    mimeType: string,
    extension: string;
    buffer: ArrayBuffer;
}

export interface IEditMessage {
    messageId: TValueOf<Pick<IOriginalMessage, "id">>,
    text: TValueOf<Pick<IOriginalMessage, "text">>
}

// DTO classes
export class InnerMessage implements IInnerMessage {
    id: string;
    roomId: TValueOf<Pick<IRoom, "id">>;
    senderId: TValueOf<Pick<IUserDto, "id">>;
    text: string | null;
    files: TFile[];
    replyToMessageId: TValueOf<Pick<IMessage, "id">> | null;
    hasRead: boolean;

    createdAt: Date;
    updatedAt: Date | null;

    constructor({id, roomId, files, hasRead, replyToMessageId, senderId, text, createdAt, updatedAt}: IInnerMessage) {
        this.id = id;
        this.roomId = roomId;
        this.senderId = senderId;
        this.text = text;
        this.files = files;
        this.replyToMessageId = replyToMessageId;
        this.hasRead = hasRead;

        this.createdAt = new Date(createdAt);
        this.updatedAt = updatedAt ? new Date(updatedAt) : null;
    }

}

export class InnerForwardedMessage implements IInnerForwardedMessage {
    id: string;
    roomId: TValueOf<Pick<IRoom, "id">>;
    senderId: TValueOf<Pick<IUserDto, "id">>;
    text: string | null;
    forwardedMessageId: TValueOf<Pick<IMessage, "id">> | null;
    hasRead: boolean;

    createdAt: Date;
    updatedAt: Date | null;

    constructor({id, roomId, hasRead, forwardedMessageId, senderId, text, createdAt, updatedAt}: IInnerForwardedMessage) {
        this.id = id;
        this.roomId = roomId;
        this.senderId = senderId;
        this.text = text;
        this.forwardedMessageId = forwardedMessageId;
        this.hasRead = hasRead;

        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }
}

export class Message extends InnerMessage
    implements IMessage {
    replyToMessage: InnerMessage | InnerForwardedMessage | null;
    
    constructor({replyToMessage, ...args}: IMessage) {
        super(args);
        this.replyToMessage = replyToMessage;
    }
}

export class ForwardedMessage extends InnerForwardedMessage
    implements IForwardedMessage
{
    forwardedMessage: InnerMessage | InnerForwardedMessage;

    constructor({forwardedMessage, ...args}: IForwardedMessage) {
        super(args);
        this.forwardedMessage = forwardedMessage;
    }
}

export class Attachment implements TFile {
    id: string;
    originalName: string;
    extension: string;
    fileType: FileType;
    mimeType: string;
    blob: Blob;
    createdAt: Date;

    constructor({
                    id,
                    originalName,
                    extension,
                    fileType,
                    mimeType,
                    blob,
                    createdAt,
                }: TFile) {
        this.id = id;
        this.originalName = originalName;
        this.extension = extension;
        this.fileType = fileType;
        this.mimeType = mimeType;
        this.blob = blob;
        this.createdAt = createdAt;
    }
}


// check methods
export function checkIsInnerMessageFromSocket(obj: TInnerMessageFromSocket | IInnerForwardedMessage): obj is TInnerMessageFromSocket {
    const message = obj as TInnerMessageFromSocket;
    return message.files !== undefined;
}

export function checkIsMessageFromSocket(obj: TMessageFromSocket | IForwardedMessage): obj is TMessageFromSocket {
    const message = obj as TMessageFromSocket;
    return message.files !== undefined;
}

export function checkIsInnerMessageHTTP(obj: TInnerMessageHTTPResponse | TInnerForwardedMessageHTTP): obj is TInnerMessageHTTPResponse {
    const message = obj as TInnerMessageHTTPResponse;
    return message.files !== undefined;
}

export function checkIsMessageHTTP(obj: TMessageHTTP | TForwardedMessageHTTP): obj is TMessageHTTP {
    const message = obj as TMessageHTTP;
    return message.files !== undefined;
}