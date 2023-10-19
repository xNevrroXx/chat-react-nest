import {Module} from "@nestjs/common";
import {MessageService} from "./message.service";
import {DatabaseModule} from "../database/database.module";
import {AuthService} from "../auth/auth.service";
import {TokenService} from "../token/token.service";
import {FileService} from "../file/file.service";
import {AppConstantsService} from "../app.constants.service";
import {UserService} from "../user/user.service";

@Module({
    imports: [DatabaseModule],
    providers: [MessageService, AuthService, TokenService, FileService, AppConstantsService, UserService]
})
export class MessageModule {
}
