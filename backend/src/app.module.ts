import {Module} from "@nestjs/common";
import {ConfigModule} from "@nestjs/config";
import {AppController} from "./app.controller";
import {ChatModule} from "./chat/chat.module";
import {UserModule} from "./user/user.module";
import {MessageModule} from "./message/message.module";
import {TokenService} from "./token/token.service";
import {DatabaseModule} from "./database/database.module";
import {AuthService} from "./auth/auth.service";
import {AppConstantsService} from "./app.constants.service";
import {RoomModule} from "./room/room.module";
import {ParticipantService} from "./participant/participant.service";
import {LinkPreviewController} from "./link-preview/link-preview.controller";
import {LinkPreviewService} from "./link-preview/link-preview.service";
import { FileController } from './file/file.controller';


@Module({
    imports: [
        ConfigModule.forRoot(),
        DatabaseModule,
        UserModule,
        MessageModule,
        ChatModule,
        RoomModule
    ],
    controllers: [AppController, LinkPreviewController, FileController],
    providers: [TokenService, AuthService, AppConstantsService, ParticipantService, LinkPreviewService]
})
export class AppModule {
}
