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
    isTyping: boolean,
    messages: (Message | ForwardedMessage)[]
}

export type TUserTyping = Pick<IChat, "isTyping"> & {
    userTargetId: TValueOf<Pick<IUserDto, "id">>
};

export interface IMessage extends IInnerMessage {
    replyToMessage: IInnerMessage | IInnerForwardedMessage | null;
}

export interface IForwardedMessage extends IInnerForwardedMessage {
    forwardedMessage: IInnerMessage | IInnerForwardedMessage | null;
}


export interface IInnerMessage extends IOriginalMessage {
    files: TFile[];
    replyToMessageId: TValueOf<Pick<IMessage, "id">> | null;
}

export interface IInnerForwardedMessage extends IOriginalMessage {
    forwardedMessageId: TValueOf<Pick<IMessage, "id">> | null;
}

export interface IOriginalMessage {
    id: string;
    senderId: TValueOf<Pick<IUserDto, "id">>;
    recipientId: TValueOf<Pick<IUserDto, "id">>;
    hasRead: boolean;
    text: string | null;

    createdAt: number;
    updatedAt: number | undefined;
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
    isTyping: TValueOf<Pick<IChat, "isTyping">>,
    messages: (TMessageHTTPResponse | TForwardedMessageHTTPResponse)[]
}

export type TMessageHTTPResponse =
    Omit<IMessage, "files" | "replyToMessage">
    & { files: TFileHTTPResponse[] }
    & { replyToMessage: TInnerMessageHTTPResponse | IInnerForwardedMessage | null }

export type TForwardedMessageHTTPResponse =
    Omit<IForwardedMessage, "forwardedMessage">
    & { forwardedMessage: TInnerMessageHTTPResponse | IInnerForwardedMessage | null }

export type TInnerMessageHTTPResponse =
    Omit<IInnerMessage, "files">
    & { files: TFileHTTPResponse[] }

type TFileHTTPResponse = Omit<TFile, "buffer"> & {
    buffer: {
        type: "Buffer",
        data: number[]
    }
}

export type TInnerMessageFromSocket =
    Omit<IInnerMessage, "files">
    & { files: TFileFromSocket[] }

export type TMessageFromSocket =
    Omit<IMessage, "files">
    & { files: TFileFromSocket[] }
    & { replyToMessage: TInnerMessageFromSocket | IInnerForwardedMessage | null }

export type TForwardedMessageFromSocket =
    Omit<IForwardedMessage, "forwardedMessage">
    & { forwardedMessage: TInnerMessageFromSocket | IInnerForwardedMessage | null }


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
    replyToMessageId: TValueOf<Pick<IMessage, "id">> | null;
} & ISendAttachments;

export type TForwardMessage = {
    interlocutorId: TValueOf<Pick<IUserDto, "id">>;
    forwardedMessageId: TValueOf<Pick<IMessage, "id">>;
}

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

export class InnerMessage implements IInnerMessage {
    id: string;
    senderId: TValueOf<Pick<IUserDto, "id">>;
    recipientId: TValueOf<Pick<IUserDto, "id">>;
    text: string | null;
    files: TFile[];
    replyToMessageId: TValueOf<Pick<IMessage, "id">> | null;
    hasRead: boolean;

    createdAt: number;
    updatedAt: number | undefined;

    constructor({id, files, hasRead, recipientId, replyToMessageId, senderId, text, createdAt, updatedAt}: IInnerMessage) {
        this.id = id;
        this.senderId = senderId;
        this.recipientId = recipientId;
        this.text = text;
        this.files = files;
        this.replyToMessageId = replyToMessageId;
        this.hasRead = hasRead;

        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }
}

export class InnerForwardMessage implements IInnerForwardedMessage {
    id: string;
    senderId: TValueOf<Pick<IUserDto, "id">>;
    recipientId: TValueOf<Pick<IUserDto, "id">>;
    text: string | null;
    forwardedMessageId: TValueOf<Pick<IMessage, "id">> | null;
    hasRead: boolean;

    createdAt: number;
    updatedAt: number | undefined;

    constructor({id, hasRead, recipientId, forwardedMessageId, senderId, text, createdAt, updatedAt}: IInnerForwardedMessage) {
        this.id = id;
        this.senderId = senderId;
        this.recipientId = recipientId;
        this.text = text;
        this.forwardedMessageId = forwardedMessageId;
        this.hasRead = hasRead;

        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }
}

export class Message extends InnerMessage
    implements IMessage {
    replyToMessage: InnerMessage | InnerForwardMessage | null;
    
    constructor({replyToMessage, ...args}: IMessage) {
        super(args);

        if (!replyToMessage) {
            this.replyToMessage = null;
            return;
        }

        if (checkIsInnerMessage(replyToMessage)) {
            this.replyToMessage = new InnerMessage(replyToMessage);
        }
        else {
            this.replyToMessage = new InnerForwardMessage(replyToMessage);
        }
    }
}

export class ForwardedMessage extends InnerForwardMessage
    implements IForwardedMessage
{
    forwardedMessage: InnerMessage | InnerForwardMessage | null;

    constructor({forwardedMessage, ...args}: IForwardedMessage) {
        super(args);

        if (!forwardedMessage) {
            this.forwardedMessage = null;
            return;
        }

        if (checkIsInnerMessage(forwardedMessage)) {
            this.forwardedMessage = new InnerMessage(forwardedMessage);
        }
        else {
            this.forwardedMessage = new InnerForwardMessage(forwardedMessage);
        }
    }
}

export function checkIsInnerMessageFromSocket(obj: TInnerMessageFromSocket | IInnerForwardedMessage): obj is TInnerMessageFromSocket {
    const message = obj as TInnerMessageFromSocket;
    return message.files !== undefined;
}

export function checkIsInnerMessageHTTPResponse(obj: TInnerMessageHTTPResponse | IInnerForwardedMessage): obj is TInnerMessageHTTPResponse {
    const message = obj as TInnerMessageHTTPResponse;
    return message.files !== undefined;
}

export function checkIsMessageHTTPResponse(obj: TMessageHTTPResponse | TForwardedMessageHTTPResponse): obj is TMessageHTTPResponse {
    const message = obj as TMessageHTTPResponse;
    return message.files !== undefined;
}

export function checkIsInnerMessage(obj: IInnerMessage | IInnerForwardedMessage): obj is IInnerMessage {
    const message = obj as IInnerMessage;
    return message.files !== undefined;
}

export function checkIsForwardedMessage(obj: IMessage | IForwardedMessage): obj is IForwardedMessage {
    const message = obj as IForwardedMessage;
    return message.forwardedMessage !== undefined;
}