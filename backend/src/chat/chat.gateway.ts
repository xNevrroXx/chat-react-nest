import {
    MessageBody,
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer,
    OnGatewayDisconnect,
    OnGatewayConnection,
    ConnectedSocket
} from "@nestjs/websockets";
import {UseGuards} from "@nestjs/common";
import {Server, Socket} from "socket.io";
// own modules
import ApiError from "../exceptions/api-error";
import {WsAuth} from "../auth/ws-auth.guard";
import {UserService} from "../user/user.service";
import {AuthService} from "../auth/auth.service";
import {MessageService} from "../message/message.service";
// types
import {IUserPayloadJWT} from "../user/IUser";
import {TNewMessage, IUserIdToSocketId, TToggleUserTypingMessage} from "./IChat";
import {FileService} from "../file/file.service";
import {generateFileName} from "../utils/generateFileName";
import {excludeSensitiveFields} from "../utils/excludeSensitiveFields";
import {Prisma, File} from "@prisma/client";
import {TFileToClient} from "../file/IFile";
import * as mime from "mime-types";
import {isFulfilledPromise} from "../utils/isFulfilledPromise";

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
        private readonly messageService: MessageService,
        private readonly userService: UserService,
        private readonly authService: AuthService,
        private readonly fileService: FileService
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
    async handleTyping(@ConnectedSocket() client, @MessageBody() typingInfo: TToggleUserTypingMessage) {
        const userData = client.user;
        void this.toggleTypingStatus(client, userData.id, typingInfo);
    }

    async toggleTypingStatus(client, typingUserId: string, typingInfo: TToggleUserTypingMessage) {
        await this.userService.updateTypingStatus({
            userId: typingUserId,
            userTargetId: typingInfo.userTargetId,
            isTyping: typingInfo.isTyping
        });
        const interlocutorSocket = Object.entries(this.socketToUserId)
            .find(([, value]) => value === typingInfo.userTargetId);

        if (!interlocutorSocket) {
            return;
        }
        client.broadcast
            .to(interlocutorSocket[0])
            .emit("user:toggle-typing", {
                userTargetId: typingUserId,
                isTyping: typingInfo.isTyping
            });
    }

    @UseGuards(WsAuth)
    @SubscribeMessage("message")
    async handleMessage(@ConnectedSocket() client, @MessageBody() message: TNewMessage) {
        const senderPayloadJWT: IUserPayloadJWT = client.user;

        const sender = await this.userService.findOne({
            id: senderPayloadJWT.id
        });
        const recipient = await this.userService.findOne({
            id: message.interlocutorId
        });

        if (!sender || !recipient) {
            throw ApiError.BadRequest("Не найден отправитель или получатель сообщения");
        }
        void this.toggleTypingStatus(client, sender.id, {
            userTargetId: recipient.id,
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
                recipient: {
                    connect: {
                        id: recipient.id
                    }
                },
                ...replyConnect,
                text: message.text,
                files: {
                    create: successfullyRecordedAttachments
                },
            },
            include: {
                files: true,
                replyToMessage: {
                    include: {
                        files: true
                    }
                }
            }
        }) as Prisma.MessageGetPayload<{include: {files: true, replyToMessage: true}}>;
        const files: TFileToClient[] = newMessage.files.map((file, index) => {
            const f = excludeSensitiveFields(file, ["fileName", "messageId"]) as TFileToClient;
            f.buffer = message.attachments[index].buffer;
            return f;
        });
        const messageExcludingFields = {
            ...newMessage,
            files: files
        };
        this.server
            .emit("message", messageExcludingFields);
    }
}
