import {Injectable} from "@nestjs/common";
import {type User, Prisma} from "@prisma/client";
import {DatabaseService} from "../database/database.service";
import ApiError from "../exceptions/api-error";

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

    async findMany(params: {
        skip?: number;
        take?: number;
        cursor?: Prisma.UserWhereUniqueInput;
        where?: Prisma.UserWhereInput;
        orderBy?: Prisma.UserOrderByWithRelationInput;
    }): Promise<User[]> {
        const { skip, take, cursor, where, orderBy } = params;

        const users = await this.prisma.user.findMany({
            skip,
            take,
            cursor,
            where,
            orderBy,
        });
        return users;
    }

    async create(data: Prisma.UserCreateInput): Promise<User> {
        const isExistAlready = await this.prisma.user.findUnique({
            where: { email: data.email }
        });
        if (isExistAlready) {
            throw ApiError.BadRequest(`Пользователь с почтовым адресом ${data.email} уже сущетсвует`);
        }

        const newUser = await this.prisma.user.create({
            data,
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
            throw ApiError.BadRequest(`Пользователя с почтовым адресом ${data.email} не сущетсвует`);
        }

        return this.prisma.user.update({
            data,
            where,
        });
    }

    async delete(where: Prisma.UserWhereUniqueInput): Promise<User> {
        const isExist = await this.prisma.user.findUnique({where});
        if (!isExist) {
            throw ApiError.BadRequest(`Пользователя с почтовым адресом ${"BOILERPLATE"} не сущетсвует`);
        }

        return this.prisma.user.delete({where});
    }
}
