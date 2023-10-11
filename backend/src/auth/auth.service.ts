import {Injectable} from "@nestjs/common";
import {TokenService} from "../token/token.service";
import {IUserPayloadJWT} from "../user/IUser";
import ApiError from "../exceptions/api-error";

@Injectable()
export class AuthService {
    constructor(private readonly tokenService: TokenService) {}

    async verify(authorizationHeader: string): Promise<IUserPayloadJWT> {
        const accessToken = authorizationHeader.split(" ")[1];

        if (!accessToken) {
            throw ApiError.UnauthorizedError();
        }
        const userData = await this.tokenService.validateAccessToken(accessToken);
        if (!userData) {
            throw ApiError.UnauthorizedError();
        }

        return userData;
    }
}
