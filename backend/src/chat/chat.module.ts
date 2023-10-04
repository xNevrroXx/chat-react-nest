import {Module} from "@nestjs/common";
import {ChatGateway} from "./chat.gateway";
import {DatabaseModule} from "../database/database.module";
import {TokenService} from "../token/token.service";
import {MessageService} from "../message/message.service";
import {UserService} from "../user/user.service";
import {AuthService} from "../auth/auth.service";
import {FileService} from "../file/file.service";
import {AppConstantsService} from "../app.constants.service";

@Module({
    imports: [DatabaseModule],
    providers: [AuthService, TokenService, ChatGateway, MessageService, UserService, FileService, AppConstantsService]
})
export class ChatModule {
}
