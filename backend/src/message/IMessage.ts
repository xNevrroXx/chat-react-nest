import {TUserDto} from "../user/IUser";
import {TValueOf} from "../models/TUtils";
import {Message} from "@prisma/client";
import {TFileToClient} from "../file/IFile";

export type TChats = IChat[];

export interface IChat {
    userId: TValueOf<Pick<TUserDto, "id">>,
    isTyping: boolean,
    messages: ( Message & {files: TFileToClient[]} )[]
}