import {Module} from "@nestjs/common";
import {MessageController} from "./message.controller";
import {MessageService} from "./message.service";
import {DatabaseModule} from "../database/database.module";
import {AuthService} from "../auth/auth.service";
import {TokenService} from "../token/token.service";

@Module({
    imports: [DatabaseModule],
    controllers: [MessageController],
    providers: [MessageService, AuthService, TokenService]
})
export class MessageModule {
}
