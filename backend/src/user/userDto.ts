import {IsEmail, IsEnum, IsNumber, IsNumberString, IsString} from "class-validator";
import {Sex} from "@prisma/client";
import type {IUser, TUserLogin, TUserDto} from "./IUser";


export class UserDto implements TUserDto {
    id: string;
    email: string;
    name: string;
    surname: string;
    age: number;
    sex: "MALE" | "FEMALE";

    constructor(data: TUserDto) {
        this.id = data.id;
        this.email = data.email;
        this.name = data.name;
        this.surname = data.surname;
        this.age = data.age;
        this.sex = data.sex;
    }
}

export class UserRegister implements IUser {
    @IsString()
    name: string;
    @IsString()
    surname: string;
    @IsEmail()
    email: string;
    @IsNumber()
    age: number;
    @IsEnum(Sex)
    sex: "MALE" | "FEMALE";
    @IsString()
    password: string;
}

export class UserLogin implements TUserLogin {
    @IsEmail()
    email: string;
    @IsString()
    password: string;
}