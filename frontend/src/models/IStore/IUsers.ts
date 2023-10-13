import type {IUserDto} from "./IAuthentication.ts";
import {TValueOf} from "../TUtils.ts";

export interface IUsers {
    users: IUserDto[]
}

export type TUserOnline = {
    id: string
    userId: TValueOf<Pick<IUserDto, "id">>
    isOnline: boolean
    updatedAt: Date
}