import {TValueOf} from "../models/TUtils";
import {Prisma, RefreshToken} from "@prisma/client";

export interface IUser {
    name: string,
    surname: string,
    email: string,
    age: number,
    sex: "MALE" | "FEMALE",
    password: string
}

export type TUserDto = { id: string } & Omit<IUser, "password">;

export interface IUserPayloadJWT {
    id: TValueOf<Pick<TUserDto, "id">>,
    name: TValueOf<Pick<TUserDto, "name">>
}

export type TUserLogin = Pick<IUser, "email" | "password">


export function isUserWithRefreshToken(data: any): data is Prisma.UserGetPayload<{include: {refreshToken: true}}> {
    return data && data.refreshToken;
}