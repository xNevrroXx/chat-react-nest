import {Injectable} from "@nestjs/common";
import {DatabaseService} from "../database/database.service";
import {type Message, Prisma} from "@prisma/client";
import {IMessage, isForwardedMessage, TNormalizeMessageArgument} from "./IMessage";
import {TFileToClient} from "../file/IFile";
import {excludeSensitiveFields} from "../utils/excludeSensitiveFields";
import {FileService} from "../file/file.service";
import {findLinksInText} from "../utils/findLinksInText";
import {LinkPreviewService} from "../link-preview/link-preview.service";

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

    async normalize(message: TNormalizeMessageArgument): Promise<IMessage> {
        let normalizedMessage;
        if (!isForwardedMessage(message)) {
            normalizedMessage = excludeSensitiveFields(message, ["forwardedMessageId", "forwardedMessage" as any]);
            normalizedMessage.links = findLinksInText(normalizedMessage.text);

            if (normalizedMessage.links.length > 0) {
                normalizedMessage.firstLinkInfo = await this.linkPreviewService.getLinkInfo(normalizedMessage.links[0]);
            }

            if (normalizedMessage.replyToMessage) {
                if (normalizedMessage.replyToMessage.forwardedMessageId) {
                    normalizedMessage = {
                        ...normalizedMessage,
                        replyToMessage: excludeSensitiveFields(normalizedMessage.replyToMessage, ["replyToMessageId", "files", "text"])
                    };
                } else {
                    normalizedMessage = {
                        ...normalizedMessage,
                        replyToMessage: excludeSensitiveFields(normalizedMessage.replyToMessage, ["forwardedMessageId"])
                    };

                    normalizedMessage.replyToMessage.links = findLinksInText(normalizedMessage.replyToMessage.text);
                    if (normalizedMessage.replyToMessage.links.length > 0) {
                        normalizedMessage.replyToMessage.firstLinkInfo = await this.linkPreviewService.getLinkInfo(normalizedMessage.replyToMessage.links[0]);
                    }
                }
            }
            const hasFiles = normalizedMessage.files.length > 0;
            let files: TFileToClient[] = [];
            if (hasFiles) {
                files = await this.fileService.addBlobToFiles(normalizedMessage.files);
            }
            normalizedMessage = {
                ...normalizedMessage,
                files
            };
            if (
                normalizedMessage.replyToMessage
                && normalizedMessage.replyToMessage.files
                && normalizedMessage.replyToMessage.files.length > 0
            ) {
                normalizedMessage.replyToMessage.files = await this.fileService.addBlobToFiles(normalizedMessage.replyToMessage.files);
            }
        }
        else {
            normalizedMessage = excludeSensitiveFields(message, ["files", "replyToMessage", "replyToMessageId" as any]);

            if (normalizedMessage.forwardedMessage.forwardedMessageId) {
                normalizedMessage = {
                    ...normalizedMessage,
                    forwardedMessage: excludeSensitiveFields(normalizedMessage.forwardedMessage, ["files", "replyToMessageId", "replyToMessage"])
                };
            } else {
                normalizedMessage = {
                    ...normalizedMessage,
                    forwardedMessage: excludeSensitiveFields(normalizedMessage.forwardedMessage, ["forwardedMessageId"])
                };

                normalizedMessage.forwardedMessage.links = findLinksInText(normalizedMessage.replyToMessage.text);
                if (normalizedMessage.forwardedMessage.links.length > 0) {
                    normalizedMessage.forwardedMessage.firstLinkInfo = await this.linkPreviewService.getLinkInfo(normalizedMessage.forwardedMessage.links[0]);
                }

                if (normalizedMessage.forwardedMessage.files && normalizedMessage.forwardedMessage.files.length > 0) {
                    normalizedMessage.forwardedMessage.files = await this.fileService.addBlobToFiles(normalizedMessage.forwardedMessage.files);
                }
            }
        }

        return normalizedMessage as Promise<IMessage>;
    }
}