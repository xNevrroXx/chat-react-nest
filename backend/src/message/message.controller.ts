import {Controller, Get, Req, UseGuards} from "@nestjs/common";
import {MessageService} from "./message.service";
import {AuthGuard} from "../auth/auth.guard";
import {TChats} from "./IMessage";
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

        // const messages1 = await this.userService.findOne({
        //     id: userPayload.id,
        // }, {
        //     senderMessages: {
        //         where: {
        //             senderId: userPayload.id
        //         },
        //         include: {
        //             files: true
        //         }
        //     },
        //     recipientMessages: {
        //         where: {
        //             recipientId: userPayload.id
        //         },
        //         include: {
        //             files: true
        //         }
        //     },
        //     userTyping: true
        // });

        const messages = await this.messageService.findMany({
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
                }
            },
            orderBy: {
                createdAt: "asc"
            }
        }) as Prisma.MessageGetPayload<{include: {files: true}}>[];

        const chats: TChats = await messages.reduce<Promise<TChats>>(async (previousValue, message) => {
            const prev = await previousValue;
            const interlocutorId = userPayload.id === message.senderId ? message.recipientId : message.senderId;
            const chat = prev.find(chat => chat.userId === interlocutorId);
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

            if (!chat) {
                prev.push({
                    userId: interlocutorId,
                    isTyping: false,
                    messages: [{
                        ...message,
                        files
                    }]
                });
            } else {
                chat.isTyping = false;
                chat.messages.push({
                    ...message,
                    files
                });
            }


            return prev;
        }, Promise.resolve([]));

        return chats;
    }
}
