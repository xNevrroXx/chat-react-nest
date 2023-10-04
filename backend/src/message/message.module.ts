import {Module} from "@nestjs/common";
import {MessageController} from "./message.controller";
import {MessageService} from "./message.service";
import {DatabaseModule} from "../database/database.module";
import {AuthService} from "../auth/auth.service";
import {TokenService} from "../token/token.service";
import {FileService} from "../file/file.service";
import {AppConstantsService} from "../app.constants.service";

@Module({
    imports: [DatabaseModule],
    controllers: [MessageController],
    providers: [MessageService, AuthService, TokenService, FileService, AppConstantsService]
})
export class MessageModule {
}
