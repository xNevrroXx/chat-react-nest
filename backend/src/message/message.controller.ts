import {Controller, Get, Req, UseGuards} from "@nestjs/common";
import {MessageService} from "./message.service";
import {AuthGuard} from "../auth/auth.guard";
import {TChats} from "./IMessage";
import {Request} from "express";

@Controller("message")
export class MessageController {
    constructor(
        private readonly messageService: MessageService
    ) {}

    @Get("all")
    @UseGuards(AuthGuard)
    async getAll(@Req() request: Request) {
        const userPayload = request.user;

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
            orderBy: {
                createdAt: "asc"
            }
        });

        const chats: TChats = messages.reduce<TChats>((previousValue, message) => {
            const interlocutorId = userPayload.id === message.senderId ? message.recipientId : message.senderId;

            const chat = previousValue.find(chat => chat.userId === interlocutorId);
            if (!chat) {
                previousValue.push({
                    userId: interlocutorId,
                    messages: [message]
                });
            }
            else {
                chat.messages.push(message);
            }


            return previousValue;
        }, []);

        return chats;
    }
}
