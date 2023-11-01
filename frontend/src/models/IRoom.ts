import {IFile} from "./IStore/IRoom.ts";

export interface ILastMessageInfo {
    sender: "Вы" | string,
    text: string,
    hasRead: boolean
}

export interface IFileForRender extends IFile {
    blobUrl: string
}

export type TAttachmentType = "video" | "audio" | "image" | "unknown";

export interface IKnownAndUnknownFiles {
    known: ( IFileForRender & {attachmentType: Exclude<TAttachmentType, "unknown">} )[],
    unknown: ( IFileForRender & {attachmentType: Extract<TAttachmentType, "unknown">} )[]
}