import {Controller, Get, Req, UseGuards} from "@nestjs/common";
import {UserService} from "../user/user.service";
import {MessageService} from "../message/message.service";
import {FileService} from "../file/file.service";
import {AuthGuard} from "../auth/auth.guard";
import {Request} from "express";
import {Prisma} from "@prisma/client";
import {IChat, IMessage} from "../message/IMessage";
import {RoomService} from "./room.service";
import {IRoom} from "./IRooms";

@Controller("room")
export class RoomController {
    constructor(
        private readonly messageService: MessageService,
        private readonly roomService: RoomService
    ) {
    }

    @Get("all")
    @UseGuards(AuthGuard)
    async getAll(@Req() request: Request): Promise<IRoom[]> {
        const userPayload = request.user;

        const unnormalizedRooms = await this.roomService.findMany({
            skip: 0,
            take: 10,
            where: {
                participants: {
                    some: {
                        userId: {
                            equals: userPayload.id
                        }
                    }
                }
            },
            include: {
                participants: {
                    include: {
                        user: true
                    }
                },
                usersTyping: true,
                creatorUser: true,
                messages: {
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
                }
            },
        }) as Prisma.RoomGetPayload<{
            include: {
                participants: true,
                usersTyping: true,
                creatorUser: true,
                messages: {
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
                }
            }
        }>[];

        const normalizedRoomPromises: Promise<IRoom>[] = unnormalizedRooms.map(async unnormalizedRoom => {
            const messages = await unnormalizedRoom.messages.reduce<Promise<IMessage[]>>(async (prevPromise, unnormalizedMessage) => {
                const prev = await prevPromise;
                const messages = await this.messageService.normalizeMessage(unnormalizedMessage);

                prev.push(messages);
                return prev;
            }, Promise.resolve([]));

            return {
                ...unnormalizedRoom,
                messages: messages
            };
        });

        return await Promise.all(normalizedRoomPromises);
    }
}
