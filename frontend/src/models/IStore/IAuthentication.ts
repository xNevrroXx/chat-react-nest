import {TValueOf} from "../TUtils.ts";

export interface IUser {
    name: string,
    surname: string,
    email: string,
    age: number,
    sex: "MALE" | "FEMALE"
}

export interface IUserAuth extends IUser {
    password: string
}

export interface IUserDto extends IUser {
    id: string
}

export interface IAuthentication {
    user: IUserDto | null,
    isAuthenticated: boolean
}

export type TLoginFormData = Omit<IUserAuth, "name" | "surname" | "sex" | "age">;
export type TRegisterFormData = IUserAuth & { passwordConfirmation: TValueOf<Pick<IUserAuth, "password">> };