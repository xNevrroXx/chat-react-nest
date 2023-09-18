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
import {INewMessage} from "./IChat";

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
        private readonly userService: UserService
    ) {}

    @WebSocketServer()
    server: Server;

    @UseGuards(WsAuth)
    handleConnection(@ConnectedSocket() client: Socket) {
        console.log("Connection");
        client.emit("message", "Hey there!");
    }

    @UseGuards(WsAuth)
    handleDisconnect(@ConnectedSocket() client: Socket) {
        console.log("Disconnect!");
    }

    @UseGuards(WsAuth)
    @SubscribeMessage("message")
    async handleMessage(@ConnectedSocket() client, @MessageBody() message: INewMessage) {
        const senderPayloadJWT: IUserPayloadJWT = client.user;
        console.log("senderPayloadJWT: ", senderPayloadJWT);
        console.log("message: ", message);

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
        this.server.emit("message", newMessage);
    }
}
