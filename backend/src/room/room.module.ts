import {Module} from "@nestjs/common";
import {RoomService} from "./room.service";
import {RoomController} from "./room.controller";
import {DatabaseService} from "../database/database.service";
import {AuthService} from "../auth/auth.service";
import {TokenService} from "../token/token.service";
import {UserService} from "../user/user.service";
import {FileService} from "../file/file.service";
import {AppConstantsService} from "../app.constants.service";
import {MessageService} from "../message/message.service";
import {ParticipantService} from "../participant/participant.service";
import {LinkPreviewService} from "../link-preview/link-preview.service";

@Module({
    controllers: [RoomController],
    providers: [
        RoomService,
        DatabaseService,
        AuthService,
        TokenService,
        UserService,
        FileService,
        AppConstantsService,
        MessageService,
        ParticipantService,
        LinkPreviewService
    ]
})
export class RoomModule {
}
