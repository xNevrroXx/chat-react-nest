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
import {TNewMessage, IUserIdToSocketId, TToggleUserTyping, TNewForwardedMessage, TNewEditedMessage} from "./IChat";
import {FileService} from "../file/file.service";
import {generateFileName} from "../utils/generateFileName";
import {excludeSensitiveFields} from "../utils/excludeSensitiveFields";
import {Prisma, File, Room, RoomType} from "@prisma/client";
import {TFileToClient} from "../file/IFile";
import * as mime from "mime-types";
import {isFulfilledPromise} from "../utils/isFulfilledPromise";
import {RoomService} from "../room/room.service";
import {ParticipantService} from "../participant/participant.service";
// import {WsExceptionsFilter} from "../exceptions/ws-exceptions.filter";

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
            const socketId = Object.entries(this.socketToUserId)
                .find(([socketId, userId]) => participant.userId === userId && socketId !== client.id);

            if (!socketId) return;
            client.broadcast
                .to(socketId)
                .emit("room:toggle-typing", normalizedParticipants);
        });
    }

    @UseGuards(WsAuth)
    @SubscribeMessage("message:edit")
    async handleEditMessage(@ConnectedSocket() client, @MessageBody() message: TNewEditedMessage) {
        const senderPayloadJWT: IUserPayloadJWT = client.user;

        const sender = await this.userService.findOne({
            id: senderPayloadJWT.id
        });
        if (!sender) {
            throw HttpError.BadRequest("Не найден отправитель сообщения");
        }

        const updatedMessage = await this.messageService.update({
            where: {
                id: message.messageId
            },
            data: {
                text: message.text
            }
        });

        const participants = await this.participantService.findMany({
            where: {
                roomId: updatedMessage.roomId
            }
        });
        participants.forEach(participant => {
            const socketId = Object.entries(this.socketToUserId)
                .find(([, userId]) => participant.userId === userId);
            const editedMessageInfo = {
                roomId: updatedMessage.roomId,
                ...message
            };

            client.emit("message:edited", editedMessageInfo);
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
                        room: true,
                        files: true,
                        replyToMessage: {
                            include: {
                                files: true
                            }
                        }
                    }
                }
            }
        }) as Prisma.MessageGetPayload<{include: {room: true, files: true, replyToMessage: true}}>;
        
        const newMessageExcludingFields =
            excludeSensitiveFields(newMessage, ["replyToMessageId"]); // files

        this.server
            .emit("message:forwarded", newMessageExcludingFields);
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


        const attachmentPromises: Promise<Omit<File, "id" | "messageId" | "createdAt">>[] = message.attachments.map(async (value) => {
            let extension: string;
            if (value.extension.length > 0) {
                extension = value.extension;
            }
            else {
                extension = mime.extension(value.mimeType) || value.mimeType.concat("/")[1];
            }
            const fileName = generateFileName(sender.id, value.fileType, extension);

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
                }
            }
        }) as Prisma.MessageGetPayload<{include: {files: true, replyToMessage: true}}>;
        const files: TFileToClient[] = newMessage.files.map((file) => {
            const fileInfo = excludeSensitiveFields(file, ["fileName", "messageId"]) as TFileToClient;
            const attachment = message.attachments.find(fileInfoMessage => fileInfoMessage.originalName === fileInfo.originalName);
            if (!attachment) {
                throw HttpError.InternalServerError("Не удалось сопоставить пришедший и отправляемый файлы");
            }
            fileInfo.buffer = attachment.buffer;
            return fileInfo;
        });
        const messageExcludingFields = {
            ...newMessage,
            files: files
        };
        this.server
            .emit("message", messageExcludingFields);
    }
}
