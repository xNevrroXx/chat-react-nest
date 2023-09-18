import {Module} from "@nestjs/common";
import {UserService} from "./user.service";
import {UserController} from "./user.controller";
import {DatabaseModule} from "../database/database.module";
import {TokenService} from "../token/token.service";

@Module({
    imports: [DatabaseModule],
    controllers: [UserController],
    providers: [UserService, TokenService]
})
export class UserModule {
}
