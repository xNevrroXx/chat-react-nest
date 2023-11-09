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
import * as mime from "mime-types";
// own modules
import {WsAuth} from "../auth/ws-auth.guard";
import {UserService} from "../user/user.service";
import {AuthService} from "../auth/auth.service";
import {MessageService} from "../message/message.service";
import {RoomService} from "../room/room.service";
import {ParticipantService} from "../participant/participant.service";
import {FileService} from "../file/file.service";
import {SocketRoomsInfo} from "./SocketRoomsInfo.class";
import {generateFileName} from "../utils/generateFileName";
import {brToNewLineChars} from "../utils/brToNewLineChars ";
import {isFulfilledPromise} from "../utils/isFulfilledPromise";
import {codeBlocksToHTML} from "../utils/codeBlocksToHTML";
// types
import {IUserPayloadJWT} from "../user/IUser";
import {
    TNewMessage,
    TToggleUserTyping,
    TNewForwardedMessage,
    TNewEditedMessage,
    TDeleteMessage, TPinMessage
} from "./IChat";
import {Prisma, File} from "@prisma/client";



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
    @WebSocketServer()
    server: Server;
    socketRoomsInfo: SocketRoomsInfo;

    constructor(
        private readonly roomService: RoomService,
        private readonly messageService: MessageService,
        private readonly userService: UserService,
        private readonly authService: AuthService,
        private readonly fileService: FileService,
        private readonly participantService: ParticipantService
    ) {
        this.socketRoomsInfo = new SocketRoomsInfo();
    }

    async handleConnection(@ConnectedSocket() client: Socket) {
        const userData = await this.authService.verify(client.handshake.headers.authorization);
        const userRooms = await this.roomService.findMany({
            where: {
                participants: {
                    some: {
                        userId: {
                            equals: userData.id
                        }
                    }
                }
            }
        });

        const userOnline = await this.userService.updateOnlineStatus({
            userId: userData.id,
            isOnline: true
        });

        userRooms.forEach(room => {
            this.socketRoomsInfo.join(room.id, userData.id, client.id);
            client.join(room.id);

            client.broadcast
                .to(room.id)
                .emit("user:toggle-online", userOnline);
        });
    }


    async handleDisconnect(@ConnectedSocket() client) {
        const {userId, roomIDs} = this.socketRoomsInfo.leave(client.id);

        const userOnline = await this.userService.updateOnlineStatus({
            userId: userId,
            isOnline: false
        });

        roomIDs.forEach(roomId => {
            client.broadcast
                .to(roomId)
                .emit("user:toggle-online", userOnline);
        });
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
            const userIdToSocketId = Object.entries(this.socketRoomsInfo.getRoomInfo(roomId))
                .find(([userId, socketId]) => participant.userId === userId && socketId !== client.id);

            if (!userIdToSocketId) return;
            const [userId, clientId] = userIdToSocketId;
            const excludingThisUserTypingInfo = normalizedParticipants
                .filter(participant => participant.userId !== userId);

            client.broadcast
                .to(clientId)
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

        this.server
            .to(pinnedMessage.roomId)
            .emit("message:pinned", responseInfo);
    }

    @UseGuards(WsAuth)
    @SubscribeMessage("message:delete")
    async handleDeleteMessage(@ConnectedSocket() client, @MessageBody() message: TDeleteMessage) {
        // todo
        //  if this one shouldn't be delete for everyone -
        //      check if there are users who have deleted this message.
        //          And if every user deleted this message - clear all data about this one.
        const senderPayloadJWT: IUserPayloadJWT = client.user;

        const sender = await this.userService.findOne({
            id: senderPayloadJWT.id
        });
        if (!sender) {
            throw new WsException("Не найден отправитель сообщения");
        }
        const deletedMessageQuery: Prisma.MessageUpdateInput = message.isForEveryone ?
            {isDeleteForEveryone: true}
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
        }) as Prisma.MessageGetPayload<{
            include: {
                repliesThisMessage: true,
                forwardThisMessage: true
            }
        }>;

        const editedMessageInfo = {
            roomId: deletedMessage.roomId,
            messageId: deletedMessage.id,
            isDeleted: true
        };
        if (!message.isForEveryone) {
            client.emit("message:deleted", editedMessageInfo);
        }
        else if (deletedMessage.repliesThisMessage.length === 0 && deletedMessage.forwardThisMessage.length === 0) {
            // delete the message there no references to this one in other messages
            void this.messageService.delete({
                id: deletedMessage.id
            });
            this.server
                .to(deletedMessage.roomId)
                .emit("message:deleted", editedMessageInfo);
        }
        else {
            client.broadcast
                .to(deletedMessage.roomId)
                .emit("message:deleted", editedMessageInfo);
        }
    }

    @UseGuards(WsAuth)
    @SubscribeMessage("message:edit")
    async handleEditedMessage(@ConnectedSocket() client, @MessageBody() message: TNewEditedMessage) {
        const senderPayloadJWT: IUserPayloadJWT = client.user;

        if (message.text && message.text.length > 0) {
            message.text = brToNewLineChars(message.text).trim();
            if (message.text.length === 0) {
                return;
            }
        }

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
                text: message.text,
                updatedAt: new Date()
            }
        });
        if (!updatedMessage || updatedMessage.senderId !== sender.id) {
            throw new WsException("Сообщение либо не существует, либо вы пытаетесь изменить не свое сообщение");
        }

        const editedMessageInfo = {
            roomId: updatedMessage.roomId,
            messageId: message.messageId,
            text: codeBlocksToHTML(message.text),
            updatedAt: updatedMessage.updatedAt
        };

        this.server
            .to(editedMessageInfo.roomId)
            .emit("message:edited", editedMessageInfo);
    }

    @UseGuards(WsAuth)
    @SubscribeMessage("message:forward")
    async handleForwardMessage(@ConnectedSocket() client, @MessageBody() message: TNewForwardedMessage) {
        const senderPayloadJWT: IUserPayloadJWT = client.user;

        const sender = await this.userService.findOne({
            id: senderPayloadJWT.id
        });
        if (!sender) {
            throw new WsException("Не найден отправитель сообщения");
        }
        const room = await this.roomService.findOne({
            id: message.roomId
        });
        if (!room) {
            throw new WsException("Комната не найдена");
        }

        const forwardedMessage = await this.messageService.findOne({
            id: message.forwardedMessageId
        });
        if (!forwardedMessage) {
            throw new WsException("Пересылаемое сообщение не существует");
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
        }) as Prisma.MessageGetPayload<{
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
            }}>;
        const normalizedMessage = await this.messageService.normalize(sender.id, newMessage);

        this.server
            .to(forwardedMessage.roomId)
            .emit("message:forwarded", normalizedMessage);
    }

    @UseGuards(WsAuth)
    @SubscribeMessage("message")
    async handleMessage(@ConnectedSocket() client, @MessageBody() message: TNewMessage) {
        const senderPayloadJWT: IUserPayloadJWT = client.user;

        if (message.text && message.text.length > 0) {
            message.text = brToNewLineChars(message.text).trim();
            if (message.text.length === 0) {
                return;
            }
        }

        const sender = await this.userService.findOne({
            id: senderPayloadJWT.id
        });
        if (!sender) {
            throw new WsException("Не найден отправитель сообщения");
        }

        const room = await this.roomService.findOne({
            id: message.roomId
        });
        if (!room) {
            throw new WsException("Комната не найдена");
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

        this.server
            .to(message.roomId)
            .emit("message", normalizedMessage);
    }
}
