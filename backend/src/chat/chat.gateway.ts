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
import {MessageService} from "../message/message.service";
import {UserService} from "../user/user.service";
// types
import {IUserPayloadJWT} from "../user/IUser";
import {INewMessage, IUserIdToSocketId} from "./IChat";
import {AuthService} from "../auth/auth.service";

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
        private readonly authService: AuthService
    ) {}

    @WebSocketServer()
    server: Server;

    userIdToSocketId: IUserIdToSocketId = {};

    async handleConnection(@ConnectedSocket() client) {
        const userData = await this.authService.verify(client.handshake.headers.authorization);
        console.log("before connect: ", this.userIdToSocketId);
        this.userIdToSocketId[userData.id] = client.id;
        console.log("connect: ", this.userIdToSocketId);
    }

    @UseGuards(WsAuth)
    handleDisconnect(@ConnectedSocket() client) {
        delete this.userIdToSocketId[client.id];
        console.log("disconnect: ", this.userIdToSocketId);
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
            type: message.type,
            text: message.text
        });

        client.emit("message", newMessage);
        if (!this.userIdToSocketId[recipient.id]) {
            return;
        }
        this.server
            .to(this.userIdToSocketId[recipient.id])
            .emit("message", newMessage);
    }
}
