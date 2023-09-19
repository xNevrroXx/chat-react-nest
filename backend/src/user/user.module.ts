import {Module} from "@nestjs/common";
import {UserService} from "./user.service";
import {UserController} from "./user.controller";
import {DatabaseModule} from "../database/database.module";
import {TokenService} from "../token/token.service";
import {AuthService} from "../auth/auth.service";

@Module({
    imports: [DatabaseModule],
    controllers: [UserController],
    providers: [AuthService, UserService, TokenService]
})
export class UserModule {
}
