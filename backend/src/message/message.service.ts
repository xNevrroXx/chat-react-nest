import {Injectable} from "@nestjs/common";
import {DatabaseService} from "../database/database.service";
import {type Message, Prisma, User} from "@prisma/client";

@Injectable()
export class MessageService {
    constructor(private prisma: DatabaseService) {
    }

    async findOne(
        messageWhereUniqueInput: Prisma.MessageWhereUniqueInput
    ): Promise<Message | null> {
        return this.prisma.message.findUnique({
            where: messageWhereUniqueInput
        });
    }

    async findMany(
        params: {
            skip?: number;
            take?: number;
            cursor?: Prisma.MessageWhereUniqueInput;
            where?: Prisma.MessageWhereInput;
            orderBy?: Prisma.MessageOrderByWithRelationInput;
        }
    ): Promise<Message[]> {
        const {skip, take, cursor, where, orderBy} = params;

        return this.prisma.message.findMany({
            skip,
            take,
            cursor,
            where,
            orderBy
        });
    }

    async create<T extends Prisma.MessageInclude>(
        params: {
            data: Prisma.MessageCreateInput,
            include?: T
        }
    ): Promise<Prisma.MessageGetPayload<{include: T}> | Message | null> {
        return this.prisma.message.create(params);
    }

    async update(params: {
        where: Prisma.MessageWhereUniqueInput;
        data: Prisma.MessageUpdateInput;
    }): Promise<Message> {
        const {where, data} = params;

        return this.prisma.message.update({
            where,
            data
        });
    }

    async delete(where: Prisma.MessageWhereUniqueInput): Promise<Message> {
        return this.prisma.message.delete({
            where
        });
    }
}
