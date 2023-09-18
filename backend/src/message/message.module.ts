import {Module} from "@nestjs/common";
import {MessageController} from "./message.controller";
import {MessageService} from "./message.service";
import {DatabaseModule} from "../database/database.module";

@Module({
    imports: [DatabaseModule],
    controllers: [MessageController],
    providers: [MessageService]
})
export class MessageModule {
}
