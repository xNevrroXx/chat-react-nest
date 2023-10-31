import {
    MessageBody,
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer,
    OnGatewayDisconnect,
    OnGatewayConnection,
    ConnectedSocket, BaseWsExceptionFilter, WsException
} from "@nestjs/websockets";
import {UseFilters, UseGuards} from "@nestjs/common";
import {Server, Socket} from "socket.io";
// own modules
import HttpError from "../exceptions/http-error";
import {WsAuth} from "../auth/ws-auth.guard";
import {UserService} from "../user/user.service";
import {AuthService} from "../auth/auth.service";
import {MessageService} from "../message/message.service";
// types
import {IUserPayloadJWT} from "../user/IUser";
import {
    TNewMessage,
    IUserIdToSocketId,
    TToggleUserTyping,
    TNewForwardedMessage,
    TNewEditedMessage,
    TDeleteMessage, TPinMessage
} from "./IChat";
import {FileService} from "../file/file.service";
import {generateFileName} from "../utils/generateFileName";
import {Prisma, File, Room, RoomType} from "@prisma/client";
import * as mime from "mime-types";
import {isFulfilledPromise} from "../utils/isFulfilledPromise";
import {RoomService} from "../room/room.service";
import {ParticipantService} from "../participant/participant.service";

@UseFilters(BaseWsExceptionFilter)
@WebSocketGateway({
    namespace: "api/chat",
    cors: {
        origin: "*"
    }
})
export class ChatGateway
        implements OnGatewayConnection, OnGatewayDisconnect
{
    constructor(
        private readonly roomService: RoomService,
        private readonly messageService: MessageService,
        private readonly userService: UserService,
        private readonly authService: AuthService,
        private readonly fileService: FileService,
        private readonly participantService: ParticipantService
    ) {}

    @WebSocketServer()
    server: Server;

    socketToUserId: IUserIdToSocketId = {};

    async handleConnection(@ConnectedSocket() client: Socket) {
        const userData = await this.authService.verify(client.handshake.headers.authorization);
        this.socketToUserId[client.id] = userData.id;
        const userOnline = await this.userService.updateOnlineStatus({
            userId: userData.id,
            isOnline: true
        });
        client.broadcast.emit("user:toggle-online", userOnline);
    }

    async handleDisconnect(@ConnectedSocket() client) {
        const userId = this.socketToUserId[client.id];
        delete this.socketToUserId[client.id];
        const userOnline = await this.userService.updateOnlineStatus({
            userId: userId,
            isOnline: false
        });
        client.broadcast.emit("user:toggle-online", userOnline);
    }

    @UseGuards(WsAuth)
    @SubscribeMessage("user:toggle-typing")
    async handleTyping(@ConnectedSocket() client, @MessageBody() typingInfo: Omit<TToggleUserTyping, "userId">) {
        const userPayload: IUserPayloadJWT = client.user;
        void this.toggleTypingStatus(client, {
            userId: userPayload.id,
            ...typingInfo
        });
    }

    async toggleTypingStatus(client, {userId, roomId, isTyping}: TToggleUserTyping) {
        await this.userService.updateTypingStatus({
            userId,
            isTyping,
            roomId
        });

        const participants = await this.participantService.findMany({
            where: {
                roomId: roomId
            },
            include: {
                user: {
                    include: {
                        userOnline: true,
                        userTyping: true
                    }
                }
            }
        });
        const normalizedParticipants = participants.map(this.participantService.normalize);
        normalizedParticipants.forEach(participant => {
            const socketInfo: [string, string] | undefined = Object.entries(this.socketToUserId)
                .find(([socketId, userId]) => participant.userId === userId && socketId !== client.id);

            if (!socketInfo) return;
            const excludingThisUserTypingInfo = normalizedParticipants
                .filter(participant => participant.userId !== socketInfo[1]);

            client.broadcast
                .to(socketInfo[0])
                .emit("room:toggle-typing", excludingThisUserTypingInfo);
        });
    }

    @UseGuards(WsAuth)
    @SubscribeMessage("message:pin")
    async handlePinMessage(@ConnectedSocket() client, @MessageBody() message: TPinMessage) {
        const senderPayloadJWT: IUserPayloadJWT = client.user;

        const sender = await this.userService.findOne({
            id: senderPayloadJWT.id
        });
        if (!sender) {
            throw new WsException("Не найден отправитель сообщения");
        }
        const pinnedMessage = await this.messageService.update({
            where: {
                id: message.messageId
            },
            data: {
                pinnedMessages: {
                    create: {
                        roomId: message.roomId
                    },
                }
            },
            include: {
                room: {
                    include: {
                        pinnedMessages: {
                            include: {
                                message: true
                            }
                        }
                    }
                }
            }
        }) as Prisma.MessageGetPayload<{
            include: {
                room: {
                    include: {
                        pinnedMessages: {
                            include: {
                                message: true
                            }
                        }
                    }
                }
            }
        }>;

        const participants = await this.participantService.findMany({
            where: {
                roomId: pinnedMessage.roomId
            }
        });

        const responseInfo = {
            roomId: pinnedMessage.roomId,
            messages: pinnedMessage.room.pinnedMessages.map(pinnedMessage => {
                return {
                    id: pinnedMessage.id,
                    text: pinnedMessage.message.text,
                    messageId: pinnedMessage.message.id
                };
            })
        };

        client.emit("message:pinned", responseInfo);
        participants.forEach(participant => {
            const socketId = Object.entries(this.socketToUserId)
                .find(([, userId]) => participant.userId === userId);

            if (!socketId) return;
            client
                .to(socketId)
                .emit("message:pinned", responseInfo);
        });
    }

    @UseGuards(WsAuth)
    @SubscribeMessage("message:delete")
    async handleDeleteMessage(@ConnectedSocket() client, @MessageBody() message: TDeleteMessage) {
        const senderPayloadJWT: IUserPayloadJWT = client.user;

        const sender = await this.userService.findOne({
            id: senderPayloadJWT.id
        });
        if (!sender) {
            throw new WsException("Не найден отправитель сообщения");
        }
        const deletedMessageQuery: Prisma.MessageUpdateInput = message.isForEveryone ?
            { isDeleteForEveryone: true }
            :
            {
                usersDeletedThisMessage: {
                    connect: {
                        id: sender.id
                    }
                }
            };
        const deletedMessage = await this.messageService.update({
            where: {
                id: message.messageId
            },
            data: deletedMessageQuery,
            include: {
                repliesThisMessage: true,
                forwardThisMessage: true
            }
        }) as Prisma.MessageGetPayload<{ include: {
                repliesThisMessage: true,
                forwardThisMessage: true
            }
        }>;

        if (message.isForEveryone && deletedMessage.repliesThisMessage.length === 0 && deletedMessage.forwardThisMessage.length === 0) {
            // delete the message there no references to this one in other messages
            void this.messageService.delete({
                id: deletedMessage.id
            });
        }

        const participants = await this.participantService.findMany({
            where: {
                roomId: deletedMessage.roomId
            }
        });
        const editedMessageInfo = {
            roomId: deletedMessage.roomId,
            messageId: deletedMessage.id,
            isDeleted: true
        };
        client.emit("message:deleted", editedMessageInfo);

        if (!message.isForEveryone) return;
        participants.forEach(participant => {
            const socketId = Object.entries(this.socketToUserId)
                .find(([, userId]) => participant.userId === userId);

            if (!socketId) return;
            client
                .to(socketId)
                .emit("message:deleted", editedMessageInfo);
        });
    }

    @UseGuards(WsAuth)
    @SubscribeMessage("message:edit")
    async handleEditedMessage(@ConnectedSocket() client, @MessageBody() message: TNewEditedMessage) {
        const senderPayloadJWT: IUserPayloadJWT = client.user;

        const sender = await this.userService.findOne({
            id: senderPayloadJWT.id
        });
        if (!sender) {
            throw new WsException("Не найден отправитель сообщения");
        }

        const updatedMessage = await this.messageService.update({
            where: {
                id: message.messageId
            },
            data: {
                text: message.text
            }
        });
        if (!updatedMessage || updatedMessage.senderId !== sender.id) {
            throw new WsException("Сообщение либо не существует, либо вы пытаетесь изменить не свое сообщение");
        }

        const editedMessageInfo = {
            roomId: updatedMessage.roomId,
            ...message
        };

        client.emit("message:edited", editedMessageInfo);
        const participants = await this.participantService.findMany({
            where: {
                roomId: updatedMessage.roomId
            }
        });
        participants.forEach(participant => {
            const socketId = Object.entries(this.socketToUserId)
                .find(([, userId]) => participant.userId === userId);

            if (!socketId) return;
            client
                .to(socketId)
                .emit("message:edited", editedMessageInfo);
        });
    }

    @UseGuards(WsAuth)
    @SubscribeMessage("message:forward")
    async handleForwardMessage(@ConnectedSocket() client, @MessageBody() message: TNewForwardedMessage) {
        const senderPayloadJWT: IUserPayloadJWT = client.user;

        const sender = await this.userService.findOne({
            id: senderPayloadJWT.id
        });
        if (!sender) {
            throw HttpError.BadRequest("Не найден отправитель сообщения");
        }
        let room: Room;
        if (!message.roomId) {
            room = await this.roomService.create({
                data: {
                    roomType: RoomType.PRIVATE
                }
            });
        }
        else {
            room = await this.roomService.findOne({
                id: message.roomId
            });
        }

        const forwardedMessage = await this.messageService.findOne({
            id: message.forwardedMessageId
        });
        if (!forwardedMessage) {
            throw HttpError.BadRequest("Пересылаемое сообщение не существует");
        }

        const newMessage = await this.messageService.create({
            data: {
                sender: {
                    connect: {
                        id: sender.id
                    }
                },
                room: {
                    connect: {
                        id: room.id
                    }
                },
                forwardedMessage: {
                    connect: {
                        id: message.forwardedMessageId
                    }
                },
            },
            include: {
                forwardedMessage: {
                    include: {
                        files: true,
                        replyToMessage: {
                            include: {
                                files: true
                            }
                        }
                    }
                },
                usersDeletedThisMessage: true
            }
        }) as Prisma.MessageGetPayload<{include: {
                forwardedMessage: {
                    include: {
                        files: true,
                        replyToMessage: {
                            include: {
                                files: true
                            }
                        }
                    }
                },
                usersDeletedThisMessage: true
            }}>;
        const normalizedMessage = await this.messageService.normalize(sender.id, newMessage);

        client.emit("message:forwarded", normalizedMessage);
        const participants = await this.participantService.findMany({
            where: {
                roomId: newMessage.roomId
            }
        });
        participants.forEach(participant => {
            const socketId = Object.entries(this.socketToUserId)
                .find(([, userId]) => participant.userId === userId);

            if (!socketId) return;
            client
                .to(socketId)
                .emit("message:forwarded", normalizedMessage);
        });
    }

    @UseGuards(WsAuth)
    @SubscribeMessage("message")
    async handleMessage(@ConnectedSocket() client, @MessageBody() message: TNewMessage) {
        const senderPayloadJWT: IUserPayloadJWT = client.user;

        const sender = await this.userService.findOne({
            id: senderPayloadJWT.id
        });
        if (!sender) {
            throw HttpError.BadRequest("Не найден отправитель сообщения");
        }

        let room: Room;
        if (!message.roomId) {
            room = await this.roomService.create({
                data: {
                    roomType: RoomType.PRIVATE
                }
            });
        }
        else {
            room = await this.roomService.findOne({
                id: message.roomId
            });
        }
        void this.toggleTypingStatus(client, {
            userId: sender.id,
            roomId: room.id,
            isTyping: false
        });


        const attachmentPromises = message.attachments.map<Promise<Omit<File, "id" | "messageId" | "createdAt">>>(async (value, index) => {
            let extension: string;
            if (value.extension.length > 0) {
                extension = value.extension;
            }
            else {
                extension = mime.extension(value.mimeType) || value.mimeType.concat("/")[1];
            }
            const fileName = generateFileName(sender.id, value.fileType, extension, index);

            return new Promise(async (resolve, reject) => {
                this.fileService.write(value.buffer, fileName)
                    .then(() => {
                        resolve({
                            fileName: fileName,
                            originalName: value.originalName,
                            fileType: value.fileType,
                            mimeType: value.mimeType,
                            extension: extension
                        });
                    })
                    .catch(error => {
                        reject(error);
                    });
            });
        });
        const attachmentPromisesResults = await Promise.allSettled(attachmentPromises);
        const successfullyRecordedAttachments =
            attachmentPromisesResults
                .filter((promiseResult) => isFulfilledPromise(promiseResult)) // ???
                .map(succeededPromise => {
                    if (isFulfilledPromise(succeededPromise)) { // add one more check
                        return succeededPromise.value; // todo: repair the narrowing type in the filter.
                    }
                });

        const replyConnect: Pick<Prisma.MessageCreateInput, "replyToMessage"> | null = message.replyToMessageId ? {
            replyToMessage: {
                connect: {
                    id: message.replyToMessageId
                }
            }
        } : null;
        const newMessage = await this.messageService.create({
            data: {
                sender: {
                    connect: {
                        id: sender.id
                    }
                },
                room: {
                    connect: {
                        id: room.id
                    }
                },
                ...replyConnect,
                text: message.text,
                files: {
                    create: successfullyRecordedAttachments
                },
            },
            include: {
                room: true,
                files: true,
                replyToMessage: {
                    include: {
                        files: true
                    }
                },
                usersDeletedThisMessage: true
            }
        }) as Prisma.MessageGetPayload<{ include: {
                    files: true,
                    replyToMessage: {
                        include: {
                            files: true
                        }
                    },
                    usersDeletedThisMessage: true
                }
            }>;
        const normalizedMessage = await this.messageService.normalize(sender.id, newMessage);

        client.emit("message", normalizedMessage);
        const participants = await this.participantService.findMany({
            where: {
                roomId: newMessage.roomId
            }
        });
        participants.forEach(participant => {
            const socketId = Object.entries(this.socketToUserId)
                .find(([, userId]) => participant.userId === userId);

            if (!socketId) return;
            client
                .to(socketId)
                .emit("message", normalizedMessage);
        });
    }
}
