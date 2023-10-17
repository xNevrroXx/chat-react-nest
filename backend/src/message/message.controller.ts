import {Controller, Get, Req, UseGuards} from "@nestjs/common";
import {MessageService} from "./message.service";
import {AuthGuard} from "../auth/auth.guard";
import {isForwardedMessage, TChats, TForwardMessage, TMessage, TMessages} from "./IMessage";
import {Request} from "express";
import {Prisma} from "@prisma/client";
import {FileService} from "../file/file.service";
import {excludeSensitiveFields} from "../utils/excludeSensitiveFields";
import {TFileToClient} from "../file/IFile";
import {UserService} from "../user/user.service";

@Controller("message")
export class MessageController {
    constructor(
        private readonly userService: UserService,
        private readonly messageService: MessageService,
        private readonly fileService: FileService
    ) {}
 
    @Get("all")
    @UseGuards(AuthGuard)
    async getAll(@Req() request: Request) {
        const userPayload = request.user;

        const ununifiedMessages = await this.messageService.findMany({
            where: {
                OR: [
                    {
                        senderId: userPayload.id
                    },
                    {
                        recipientId: userPayload.id
                    }
                ]
            },
            include: {
                files: true,
                replyToMessage: {
                    include: {
                        files: true
                    }
                },
                forwardedMessage: {
                    include: {
                        files: true,
                        replyToMessage: {
                            include: {
                                files: true
                            }
                        }
                    }
                }
            },
            orderBy: {
                createdAt: "asc"
            }
        }) as Prisma.MessageGetPayload<{
            include: {
                files: true,
                replyToMessage: {
                    include: {
                        files: true
                    }
                },
                forwardedMessage: {
                    include: {
                        files: true,
                        replyToMessage: {
                            include: {
                                files: true
                            }
                        }
                    }
                }
            }
        }>[];
        const unifiedMessages = ununifiedMessages.reduce<TMessages>((previousValue, currentValue) => {
            let unifiedMessage;
            if (isForwardedMessage(currentValue)) {
                unifiedMessage = excludeSensitiveFields(currentValue, ["files", "replyToMessage", "replyToMessageId"]);

                if (unifiedMessage.forwardedMessage.forwardedMessageId) {
                    unifiedMessage = {
                        ...unifiedMessage,
                        forwardedMessage: excludeSensitiveFields(unifiedMessage.forwardedMessage, ["files", "replyToMessageId", "replyToMessage"])
                    };
                } else {
                    unifiedMessage = {
                        ...unifiedMessage,
                        forwardedMessage: excludeSensitiveFields(unifiedMessage.forwardedMessage, ["forwardedMessageId"])
                    };
                }
            }
            else {
                unifiedMessage = excludeSensitiveFields(currentValue, ["forwardedMessageId", "forwardedMessage"]);

                if (unifiedMessage.replyToMessage) {
                    if (unifiedMessage.replyToMessage.forwardedMessageId) {
                        unifiedMessage = {
                            ...unifiedMessage,
                            replyToMessage: excludeSensitiveFields(unifiedMessage.replyToMessage, ["replyToMessageId", "files"])
                        };
                    } else {
                        unifiedMessage = {
                            ...unifiedMessage,
                            replyToMessage: excludeSensitiveFields(unifiedMessage.replyToMessage, ["forwardedMessageId"])
                        };
                    }
                }
            }

            previousValue.push(unifiedMessage);
            return previousValue;
        }, []);

        const chats: TChats = await unifiedMessages.reduce<Promise<TChats>>(async (previousValue, message) => {
            const prev = await previousValue;
            const interlocutorId = userPayload.id === message.senderId ? message.recipientId : message.senderId;
            const chat = prev.find(chat => chat.userId === interlocutorId);

            let newMessage = {} as TMessage | TForwardMessage;
            if (!isForwardedMessage(message)) {
                const hasFiles = message.files.length > 0;
                let files: TFileToClient[] = [];
                if (hasFiles) {
                    const filePromises: Promise<TFileToClient>[] = message.files.map(file => {
                        const f: TFileToClient = excludeSensitiveFields(file, ["fileName"]) as TFileToClient;
                        return this.fileService.findOnDisk(file.fileName)
                            .then((buffer) => {
                                f.buffer = buffer;
                                return f;
                            });
                    });
                    files = await Promise.all(filePromises);
                }
                newMessage = {
                    ...message,
                    files
                };
                if (message.replyToMessage && message.replyToMessage.files && message.replyToMessage.files.length > 0) {
                    const filePromises: Promise<TFileToClient>[] = message.replyToMessage.files.map(file => {
                        const f: TFileToClient = excludeSensitiveFields(file, ["fileName"]) as TFileToClient;
                        return this.fileService.findOnDisk(file.fileName)
                            .then((buffer) => {
                                f.buffer = buffer;
                                return f;
                            });
                    });
                    const innerFiles = await Promise.all(filePromises);
                    newMessage.replyToMessage.files = innerFiles;
                }

                if (!chat) {
                    prev.push({
                        userId: interlocutorId,
                        isTyping: false,
                        messages: [newMessage]
                    });
                } else {
                    chat.messages.push(newMessage);
                }
            }
            else {
                newMessage = {...message};
                if (message.forwardedMessage.files && message.forwardedMessage.files.length > 0) {
                    const filePromises: Promise<TFileToClient>[] = message.forwardedMessage.files.map(file => {
                        const f: TFileToClient = excludeSensitiveFields(file, ["fileName"]) as TFileToClient;
                        return this.fileService.findOnDisk(file.fileName)
                            .then((buffer) => {
                                f.buffer = buffer;
                                return f;
                            });
                    });
                    const innerFiles = await Promise.all(filePromises);
                    newMessage.forwardedMessage.files = innerFiles;
                }

                if (!chat) {
                    prev.push({
                        userId: interlocutorId,
                        isTyping: false,
                        messages: [newMessage]
                    });
                } else {
                    chat.messages.push(newMessage);
                }
            }


            return prev;
        }, Promise.resolve([]));

        return chats;
    }
}
