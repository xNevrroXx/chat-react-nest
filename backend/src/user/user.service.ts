import {Injectable} from "@nestjs/common";
import {type User, Prisma, UserOnline, UserTyping} from "@prisma/client";
import {DatabaseService} from "../database/database.service";
import ApiError from "../exceptions/api-error";
import {TValueOf} from "../models/TUtils";
import {IUserPayloadJWT} from "./IUser";

@Injectable()
export class UserService {
    constructor(private prisma: DatabaseService) {}

    async findOne<T extends Prisma.UserInclude>(
        userWhereUniqueInput: Prisma.UserWhereUniqueInput,
        include?: T
    ): Promise<Prisma.UserGetPayload<{include: T}> | User | null> {
        const user = await this.prisma.user.findUnique({
            where: userWhereUniqueInput,
            include
        });

        return user;
    }

    async findMany<T extends Prisma.UserInclude>(params: {
        skip?: number;
        take?: number;
        cursor?: Prisma.UserWhereUniqueInput;
        where?: Prisma.UserWhereInput;
        orderBy?: Prisma.UserOrderByWithRelationInput;
        include?: T
    }): Promise<Prisma.UserGetPayload<{include: T}>[] | User[]> {
        const { skip, take, cursor, where, orderBy, include } = params;

        const users = await this.prisma.user.findMany({
            skip,
            take,
            cursor,
            where,
            orderBy,
            include
        });
        return users;
    }

    async create(data: Prisma.UserCreateInput): Promise<User> {
        const isExistAlready = await this.prisma.user.findUnique({
            where: { email: data.email }
        });
        if (isExistAlready) {
            throw ApiError.BadRequest(`Пользователь с почтовым адресом ${data.email} уже существует`);
        }

        const newUser = await this.prisma.user.create({
            data: {
                ...data
            }

        });
        return newUser;
    }

    async update(params: {
        where: Prisma.UserWhereUniqueInput;
        data: Prisma.UserUpdateInput;
    }): Promise<User> {
        const { where, data } = params;
        const isExist = await this.prisma.user.findUnique({where});
        if (!isExist) {
            throw ApiError.BadRequest(`Пользователя с почтовым адресом ${data.email} не сущeствует`);
        }

        return this.prisma.user.update({
            data,
            where,
        });
    }

    async delete(where: Prisma.UserWhereUniqueInput): Promise<User> {
        const isExist = await this.prisma.user.findUnique({where});
        if (!isExist) {
            throw ApiError.BadRequest(`Пользователя с почтовым адресом ${"BOILERPLATE"} не существует`);
        }

        return this.prisma.user.delete({where});
    }

    async updateOnlineStatus(params: {
        userId: TValueOf<Pick<IUserPayloadJWT, "id">>,
        isOnline: TValueOf<Pick<UserOnline, "isOnline">>
    }): Promise<UserOnline> {
        const {userId, isOnline} = params;
        const isExistAlready = await this.prisma.userOnline.findUnique({
            where: {userId: userId}
        });

        let userOnline: UserOnline;
        if (!isExistAlready) {
            userOnline = await this.prisma.userOnline.create({
                data: {
                    userId,
                    isOnline
                }
            });
        }
        else {
            userOnline = await this.prisma.userOnline.update({
                where: {userId: userId},
                data: {
                    isOnline
                }
            });
        }

        return userOnline;
    }

    async updateTypingStatus(params: {
        userId: TValueOf<Pick<IUserPayloadJWT, "id">>,
        userTargetId: TValueOf<Pick<IUserPayloadJWT, "id">>,
        isTyping: TValueOf<Pick<UserTyping, "isTyping">>
    }): Promise<UserTyping> {
        const {userId, userTargetId, isTyping} = params;
        const isExistAlready = await this.prisma.userTyping.findUnique({
            where: {userId: userId}
        });

        let userTyping: UserTyping;
        if (!isExistAlready) {
            userTyping = await this.prisma.userTyping.create({
                data: {
                    userId,
                    userTargetId,
                    isTyping
                }
            });
        }
        else {
            userTyping = await this.prisma.userTyping.update({
                where: {userId: userId},
                data: {
                    userTargetId,
                    isTyping
                }
            });
        }

        return userTyping;
    }
}
