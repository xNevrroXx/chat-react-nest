import {Module} from "@nestjs/common";
import {ConfigModule} from "@nestjs/config";
import {AppController} from "./app.controller";
import {AppService} from "./app.service";
import {ChatModule} from "./chat/chat.module";
import {UserModule} from "./user/user.module";
import {MessageModule} from "./message/message.module";
import {TokenService} from "./token/token.service";
import {DatabaseModule} from "./database/database.module";
import {AuthService} from "./auth/auth.service";
import {AppConstantsService} from "./app.constants.service";
import { RoomModule } from './room/room.module';


@Module({
    imports: [
        ConfigModule.forRoot(),
        DatabaseModule,
        UserModule,
        MessageModule,
        ChatModule,
        RoomModule
    ],
    controllers: [AppController],
    providers: [AppService, TokenService, AuthService, AppConstantsService]
})
export class AppModule {
}
