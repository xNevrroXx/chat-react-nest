import {Controller, Get, Req, UseGuards} from "@nestjs/common";
import {Request} from "express";
import {AuthGuard} from "../auth/auth.guard";
import {RoomService} from "./room.service";
import {MessageService} from "../message/message.service";
import {ParticipantService} from "../participant/participant.service";
import {Prisma, RoomType} from "@prisma/client";
import {IRoom} from "./IRooms";
import {IMessage} from "../message/IMessage";

@Controller("room")
export class RoomController {
    constructor(
        private readonly participantService: ParticipantService,
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
                        user: {
                            include: {
                                userOnline: true,
                                userTyping: true,
                            }
                        }
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
                participants: {
                    include: {
                        user: {
                            include: {
                                userOnline: true,
                                userTyping: true,
                            }
                        }
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
                    }
                }
            }
        }>[];

        const normalizedRoomPromises: Promise<IRoom>[] = unnormalizedRooms.map(async unnormalizedRoom => {
            const normalizedMessages = await unnormalizedRoom.messages.reduce<Promise<IMessage[]>>(async (prevPromise, unnormalizedMessage) => {
                const prev = await prevPromise;
                const messages = await this.messageService.normalize(unnormalizedMessage);

                prev.push(messages);
                return prev;
            }, Promise.resolve([]));

            const normalizedParticipants = unnormalizedRoom.participants
                .filter(participant => participant.userId !== userPayload.id)
                .map(this.participantService.normalize);

            let roomName: string;
            if (unnormalizedRoom.roomType === RoomType.GROUP) {
                roomName = unnormalizedRoom.name;
            }
            else {
                roomName = normalizedParticipants[0].nickname;
            }

            return {
                ...unnormalizedRoom,
                name: roomName,
                participants: normalizedParticipants,
                messages: normalizedMessages
            };
        });

        return await Promise.all(normalizedRoomPromises);
    }
}
