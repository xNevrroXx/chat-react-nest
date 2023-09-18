import {TUserDto} from "../user/IUser";
import {TValueOf} from "../models/TUtils";
import {Message} from "@prisma/client";

export interface INewMessage {
    interlocutorId: TValueOf<Pick<TUserDto, "id">>;
    type: TValueOf<Pick<Message, "type">>;
    text: TValueOf<Pick<Message, "text">>;
}