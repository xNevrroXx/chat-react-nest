import {Module} from "@nestjs/common";
import {ChatGateway} from "./chat.gateway";
import {DatabaseModule} from "../database/database.module";
import {TokenService} from "../token/token.service";
import {MessageService} from "../message/message.service";
import {UserService} from "../user/user.service";

@Module({
    imports: [DatabaseModule],
    providers: [TokenService, ChatGateway, MessageService, UserService]
})
export class ChatModule {
}
