import {Injectable, UnauthorizedException} from "@nestjs/common";
import {TokenService} from "../token/token.service";
import {IUserPayloadJWT} from "../user/IUser";

@Injectable()
export class AuthService {
    constructor(private readonly tokenService: TokenService) {}

    async verify(authorizationHeader: string): Promise<IUserPayloadJWT> {
        const accessToken = authorizationHeader.split(" ")[1];

        if (!accessToken) {
            throw new UnauthorizedException();
        }
        const userData = await this.tokenService.validateAccessToken(accessToken);
        if (!userData) {
            throw new UnauthorizedException();
        }

        return userData;
    }
}
