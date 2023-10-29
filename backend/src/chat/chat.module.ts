import {Module} from "@nestjs/common";
import {ChatGateway} from "./chat.gateway";
import {DatabaseModule} from "../database/database.module";
import {TokenService} from "../token/token.service";
import {MessageService} from "../message/message.service";
import {UserService} from "../user/user.service";
import {AuthService} from "../auth/auth.service";
import {FileService} from "../file/file.service";
import {AppConstantsService} from "../app.constants.service";
import {RoomModule} from "../room/room.module";
import {RoomService} from "../room/room.service";
import {ParticipantService} from "../participant/participant.service";
import {LinkPreviewService} from "../link-preview/link-preview.service";

@Module({
    imports: [DatabaseModule, RoomModule],
    providers: [
        AuthService,
        TokenService,
        ChatGateway,
        MessageService,
        UserService,
        FileService,
        AppConstantsService,
        RoomService,
        ParticipantService,
        LinkPreviewService
    ]
})
export class ChatModule {
}
