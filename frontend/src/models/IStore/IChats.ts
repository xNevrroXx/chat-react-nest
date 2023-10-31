import {IUserDto} from "./IAuthentication.ts";
import {TValueOf} from "../TUtils.ts";
import {SocketIOService} from "../../services/SocketIO.service.ts";
import {ILinkPreviewInfo} from "../IResponse/ILinkPreviewInfo.ts";


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
    messages: (IMessage | IForwardedMessage)[],
    participants: IParticipant[]

    createdAt: string,
    updatedAt: string | undefined | null
}

export interface IParticipant {
    id: string,
    roomId: TValueOf<Pick<IRoom, "id">>,
    userId: TValueOf<Pick<IUserDto, "id">>,
    nickname: string,
    isTyping: boolean
}

export interface IUserTyping {
    userId: TValueOf<Pick<IUserDto, "id">>,
    roomId: TValueOf<Pick<IRoom, "id">>,
    isTyping: boolean,
    updatedAt: string
}

export interface IMessage extends IInnerMessage {
    replyToMessage: IInnerMessage | IInnerForwardedMessage | undefined | null;
}

export interface IForwardedMessage extends IInnerForwardedMessage {
    forwardedMessage: IInnerMessage | IInnerForwardedMessage;
}


export interface IInnerMessage extends IOriginalMessage {
    files: IFile[];
    replyToMessageId: TValueOf<Pick<IMessage, "id">> | undefined | null;
}

export interface IInnerForwardedMessage extends IOriginalMessage {
    forwardedMessageId: TValueOf<Pick<IMessage, "id">>;
}

export interface IOriginalMessage {
    id: string;
    roomId: TValueOf<Pick<IRoom, "id">>;
    senderId: TValueOf<Pick<IUserDto, "id">>;
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

// HTTP response types
type TFileHTTP = Omit<IFile, "buffer" | "createdAt"> & {
    buffer: {
        type: "Buffer",
        data: number[]
    },
    createdAt: string
}

export interface IInnerMessageHTTP extends IOriginalMessage {
    files: TFileHTTP[];
    replyToMessageId: TValueOf<Pick<IMessage, "id">> | undefined | null;
}

export interface IMessageHTTP extends IInnerMessageHTTP {
    replyToMessage: IInnerMessageHTTP | IInnerForwardedMessage | undefined | null
}

export interface IForwardedMessageHTTP extends IInnerForwardedMessage {
    forwardedMessage: IInnerMessageHTTP | IInnerForwardedMessage
}

export type TRoomHTTP = Omit<IRoom, "messages"> & {
    messages: (IMessageHTTP | IForwardedMessageHTTP)[]
}



// Socket response types
type TFileSocket = Omit<TFileHTTP, "buffer"> & {
    buffer: ArrayBuffer
}

export interface TInnerMessageSocket extends IOriginalMessage {
    files: TFileSocket[];
    replyToMessageId: TValueOf<Pick<IMessage, "id">> | undefined | null;
}

export interface IMessageSocket extends TInnerMessageSocket {
    replyToMessage: TInnerMessageSocket | IInnerForwardedMessage | undefined | null
}

export interface IForwardedMessageSocket extends IInnerForwardedMessage {
    forwardedMessage: TInnerMessageSocket | IInnerForwardedMessage
}

export interface IEditedMessageSocket {
    roomId: TValueOf<Pick<IRoom, "id">>,
    messageId: TValueOf<Pick<IOriginalMessage, "id">>,
    text: TValueOf<Pick<IOriginalMessage, "text">>
}

export interface IDeletedMessageSocket {
    roomId: TValueOf<Pick<IRoom, "id">>,
    messageId: TValueOf<Pick<IOriginalMessage, "id">>,
    isDeleted: boolean
}


// only client types(without responses) to send data
export type TSendUserTyping = Omit<IUserTyping, "updatedAt" | "userId">

export type TSendMessage = {
    roomId: TValueOf<Pick<IRoom, "id">>;
    text: TValueOf<Pick<IMessage, "text">>;
    replyToMessageId: TValueOf<Pick<IMessage, "id">> | undefined | null;
} & ISendAttachments;

export interface IForwardMessage {
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

export interface IDeleteMessage {
    messageId: TValueOf<Pick<IOriginalMessage, "id">>,
    isForEveryone: boolean
}

export interface IEditMessage {
    messageId: TValueOf<Pick<IOriginalMessage, "id">>,
    text: TValueOf<Pick<IOriginalMessage, "text">>
}


// check methods
export function checkIsInnerMessageSocket(obj: TInnerMessageSocket | IInnerForwardedMessage): obj is TInnerMessageSocket {
    const message = obj as TInnerMessageSocket;
    return message.files !== undefined;
}

export function checkIsInnerMessageHTTP(obj: IInnerMessageHTTP | IInnerForwardedMessage): obj is IInnerMessageHTTP {
    const message = obj as IInnerMessageHTTP;
    return message.files !== undefined;
}

export function checkIsMessageHTTP(obj: IMessageHTTP | IForwardedMessageHTTP): obj is IMessageHTTP {
    const message = obj as IMessageHTTP;
    return message.files !== undefined;
}

export function checkIsMessage(obj: IMessage | IForwardedMessage): obj is IMessage {
    const message = obj as IMessage;
    return message.files !== undefined;
}

export function checkIsInnerMessage(obj: IInnerMessage | IInnerForwardedMessage): obj is IInnerMessage {
    const message = obj as IInnerMessage;
    return message.files !== undefined;
}