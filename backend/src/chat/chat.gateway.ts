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
import {Server} from "socket.io";
// own modules
import ApiError from "../exceptions/api-error";
import {WsAuth} from "../auth/ws-auth.guard";
import {UserService} from "../user/user.service";
import {AuthService} from "../auth/auth.service";
import {MessageService} from "../message/message.service";
// types
import {IUserPayloadJWT} from "../user/IUser";
import {INewMessage, INewVoiceMessage, IUserIdToSocketId} from "./IChat";
import {FileService} from "../file/file.service";
import {generateFileName} from "../utils/generateFileName";
import {excludeSensitiveFields} from "../utils/excludeSensitiveFields";
import {Prisma, FileType} from "@prisma/client";
import {TFileToClient} from "../file/IFile";

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

    userIdToSocketId: IUserIdToSocketId = {};

    async handleConnection(@ConnectedSocket() client) {
        const userData = await this.authService.verify(client.handshake.headers.authorization);
        this.userIdToSocketId[userData.id] = client.id;
    }

    @UseGuards(WsAuth)
    handleDisconnect(@ConnectedSocket() client) {
        delete this.userIdToSocketId[client.id];
    }

    @UseGuards(WsAuth)
    @SubscribeMessage("message")
    async handleMessage(@ConnectedSocket() client, @MessageBody() message: INewMessage) {
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
                text: message.text
            }
        });

        client.emit("message", newMessage);
        if (!this.userIdToSocketId[recipient.id]) {
            return;
        }
        this.server
            .to(this.userIdToSocketId[recipient.id])
            .emit("message", newMessage);
    }

    @UseGuards(WsAuth)
    @SubscribeMessage("voiceMessage")
    async handleAudioMessage(@ConnectedSocket() client, @MessageBody() message: INewVoiceMessage) {
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

        const filename = generateFileName(sender.id);
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
                files: {
                    create: [
                        {
                            filename: filename,
                            type: FileType.VOICE
                        }
                    ]
                }
            },
            include: {
                files: true
            }
        }) as Prisma.MessageGetPayload<{include: {files: true}}>;

        void this.fileService.write(message.blob, filename);
        const voiceFile: TFileToClient = newMessage.files.map(file => {
            const f = excludeSensitiveFields(file, ["filename", "messageId"]) as TFileToClient;
            f.buffer = message.blob;
            return f;
        })[0];
        const messageExcludingFields = {
            ...newMessage,
            files: [voiceFile]
        };

        client.emit("message", messageExcludingFields);
        if (!this.userIdToSocketId[recipient.id]) {
            return;
        }
        this.server
            .to(this.userIdToSocketId[recipient.id])
            .emit("voiceMessage", messageExcludingFields);
    }
}
