import {Module} from "@nestjs/common";
import {ConfigModule} from "@nestjs/config";
import {AppController} from "./app.controller";
import {AppService} from "./app.service";
import {ChatModule} from "./chat/chat.module";
import {UserModule} from "./user/user.module";
import {MessageModule} from "./message/message.module";
import {TokenService} from "./token/token.service";
import {DatabaseModule} from "./database/database.module";


@Module({
    imports: [
        ConfigModule.forRoot(),
        DatabaseModule,
        UserModule,
        MessageModule,
        ChatModule
    ],
    controllers: [AppController],
    providers: [AppService, TokenService]
})
export class AppModule {}
