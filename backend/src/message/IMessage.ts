import {TUserDto} from "../user/IUser";
import {TValueOf} from "../models/TUtils";
import {Message} from "@prisma/client";

export type TChats = IChat[];

export interface IChat {
    userId: TValueOf<Pick<TUserDto, "id">>,
    messages: Message[]
}