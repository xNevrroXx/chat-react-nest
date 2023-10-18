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
    id: string,
    updatedAt: Date,
    createdAt: Date,
    userOnline: UserOnline
}

export type TUserOnline = {
    id: string
    userId: TValueOf<Pick<IUserDto, "id">>
    isOnline: boolean
    updatedAt: Date
}

export interface IAuthentication {
    user: IUserDto | null,
    isAuthenticated: boolean
}

// http
export interface IUserDtoHTTP extends IUser {
    id: string,
    updatedAt: string,
    createdAt: string,
    userOnline: TUserOnlineHTTP
}

export type TUserOnlineHTTP = {
    id: string
    userId: TValueOf<Pick<IUserDto, "id">>
    isOnline: boolean
    updatedAt: string
}

export interface IAuthenticationHTTP {
    user: IUserDtoHTTP | null,
    isAuthenticated: boolean
}

export class UserDto implements IUserDto {
    id: string;
    email: string;
    name: string;
    surname: string;
    age: number;
    sex: "MALE" | "FEMALE";
    userOnline: TUserOnline;

    createdAt: Date;
    updatedAt: Date;

    constructor({id, email, name, surname, age, sex, userOnline, createdAt, updatedAt}: IUserDto) {
        this.id = id;
        this.email = email;
        this.name = name;
        this.surname = surname;
        this.age = age;
        this.sex = sex;
        this.userOnline = userOnline;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }
}

export class UserOnline implements TUserOnline {
    id: string;
    isOnline: boolean;
    updatedAt: Date;
    userId: TValueOf<Pick<IUserDto, "id">>;

    constructor({id, userId, isOnline, updatedAt}: TUserOnline) {
        this.id = id;
        this.userId = userId;
        this.isOnline = isOnline;
        this.updatedAt = updatedAt;
    }
}

export type TLoginFormData = Omit<IUserAuth, "name" | "surname" | "sex" | "age">;
export type TRegisterFormData = Omit<IUserAuth, "sex"> & { passwordConfirmation: TValueOf<Pick<IUserAuth, "password">>, sex: string};