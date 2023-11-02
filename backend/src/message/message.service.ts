import {Injectable} from "@nestjs/common";
import {DatabaseService} from "../database/database.service";
import {type Message, Prisma, User} from "@prisma/client";
import {
    IInnerForwardedMessage,
    IInnerMessage,
    IMessage,
    isForwardedMessagePrisma,
    isInnerForwardedMessage,
    isInnerMessage,
    TForwardedMessage,
    TMessage,
    TNormalizeMessageArgument
} from "./TMessage";
import {TFileToClient} from "../file/IFile";
import {excludeSensitiveFields} from "../utils/excludeSensitiveFields";
import {FileService} from "../file/file.service";
import {findLinksInText} from "../utils/findLinksInText";
import {LinkPreviewService} from "../link-preview/link-preview.service";
import {TValueOf} from "../models/TUtils";
import {normalizeDate} from "../utils/normalizeDate";

@Injectable()
export class MessageService {
    constructor(
        private readonly prisma: DatabaseService,
        private readonly fileService: FileService,
        private readonly linkPreviewService: LinkPreviewService
    ) {
    }

    async findOne(
        messageWhereUniqueInput: Prisma.MessageWhereUniqueInput
    ): Promise<Message | null> {
        return this.prisma.message.findUnique({
            where: messageWhereUniqueInput
        });
    }

    async findMany<T extends Prisma.MessageInclude>(
        params: {
            skip?: number;
            take?: number;
            cursor?: Prisma.MessageWhereUniqueInput;
            where?: Prisma.MessageWhereInput;
            orderBy?: Prisma.MessageOrderByWithRelationInput;
            include?: T;
        }
    ): Promise<Prisma.MessageGetPayload<{ include: T }>[] | Message[]> {
        const {skip, take, cursor, where, orderBy, include} = params;

        return this.prisma.message.findMany({
            skip,
            take,
            cursor,
            where,
            orderBy,
            include
        });
    }

    async create<T extends Prisma.MessageInclude>(
        params: {
            data: Prisma.MessageCreateInput,
            include?: T
        }
    ): Promise<Prisma.MessageGetPayload<{ include: T }> | Message | null> {
        return this.prisma.message.create(params);
    }

    async update<T extends Prisma.MessageInclude>(params: {
        where: Prisma.MessageWhereUniqueInput;
        data: Prisma.MessageUpdateInput;
        include?: T
    }): Promise<Message> {
        const {where, data, include} = params;

        return this.prisma.message.update({
            where,
            data: {
                ...data,
                updatedAt: new Date()
            },
            include
        });
    }

    async delete(where: Prisma.MessageWhereUniqueInput): Promise<Message> {
        return this.prisma.message.delete({
            where
        });
    }

    async normalize(recipientId: TValueOf<Pick<User, "id">>, input: TNormalizeMessageArgument): Promise<IMessage> {
        const message = excludeSensitiveFields(input, ["isDeleteForEveryone", "usersDeletedThisMessage"]) as never as IMessage;
        message.createdAt = normalizeDate(message.createdAt);
        let normalizedMessage: TMessage | TForwardedMessage;
        if (!isForwardedMessagePrisma(message as any)) {
            normalizedMessage = excludeSensitiveFields(message, ["forwardedMessageId", "forwardedMessage" as any]) as TMessage;

            const hasFiles = normalizedMessage.files.length > 0;
            let files: TFileToClient[] = [];
            if (hasFiles) {
                files = await this.fileService.addBlobToFiles(normalizedMessage.files);
            }
            normalizedMessage = {
                ...normalizedMessage,
                files
            };

            normalizedMessage.links = findLinksInText(normalizedMessage.text);

            if (normalizedMessage.links.length > 0) {
                normalizedMessage.firstLinkInfo = await this.linkPreviewService.getLinkInfo(normalizedMessage.links[0]);
            }

            if (normalizedMessage.replyToMessage) {
                normalizedMessage.replyToMessage.createdAt = normalizeDate(normalizedMessage.replyToMessage.createdAt);
                if (isInnerForwardedMessage(normalizedMessage.replyToMessage)) {
                    normalizedMessage = {
                        ...normalizedMessage,
                        replyToMessage: excludeSensitiveFields(normalizedMessage.replyToMessage, ["replyToMessageId", "files", "text"] as any) as IInnerForwardedMessage
                    } as TMessage;
                }
                else if (isInnerMessage(normalizedMessage.replyToMessage)) {
                    normalizedMessage.replyToMessage.files = await this.fileService.addBlobToFiles(normalizedMessage.replyToMessage.files);

                    normalizedMessage = {
                        ...normalizedMessage,
                        replyToMessage: excludeSensitiveFields(normalizedMessage.replyToMessage, ["forwardedMessageId"] as any) as IInnerMessage
                    };

                    if (normalizedMessage.replyToMessage.text) {
                        normalizedMessage.replyToMessage.links = findLinksInText(normalizedMessage.replyToMessage.text);
                    }
                    if (normalizedMessage.replyToMessage.links && normalizedMessage.replyToMessage.links.length > 0) {
                        normalizedMessage.replyToMessage.firstLinkInfo = await this.linkPreviewService.getLinkInfo(normalizedMessage.replyToMessage.links[0]);
                    }

                }
            }
        }
        else {
            normalizedMessage = excludeSensitiveFields(message, ["files", "replyToMessage", "replyToMessageId" as any]) as TForwardedMessage;

            if (isInnerForwardedMessage(normalizedMessage.forwardedMessage)) {
                normalizedMessage.forwardedMessage.createdAt = normalizeDate(normalizedMessage.forwardedMessage.createdAt);
                normalizedMessage = {
                    ...normalizedMessage,
                    forwardedMessage: excludeSensitiveFields(normalizedMessage.forwardedMessage, ["files", "replyToMessageId", "replyToMessage"] as any)
                } as TForwardedMessage; 
            }
            else {
                normalizedMessage.forwardedMessage.createdAt = normalizeDate(normalizedMessage.forwardedMessage.createdAt);
                normalizedMessage = {
                    ...normalizedMessage,
                    forwardedMessage: excludeSensitiveFields(normalizedMessage.forwardedMessage, ["forwardedMessageId"] as any)
                } as TForwardedMessage;

                normalizedMessage.forwardedMessage.links = findLinksInText(normalizedMessage.forwardedMessage.text);
                if (normalizedMessage.forwardedMessage.links.length > 0) {
                    normalizedMessage.forwardedMessage.firstLinkInfo = await this.linkPreviewService.getLinkInfo(normalizedMessage.forwardedMessage.links[0]);
                }

                if (isInnerMessage(normalizedMessage.forwardedMessage)) {
                    normalizedMessage.forwardedMessage.files = await this.fileService.addBlobToFiles(normalizedMessage.forwardedMessage.files);
                }
            }
        }
        normalizedMessage.isDeleted = input.isDeleteForEveryone || input.usersDeletedThisMessage.some(({id}) => id === recipientId);

        return normalizedMessage;
    }
}