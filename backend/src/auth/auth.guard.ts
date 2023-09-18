import {CanActivate, ExecutionContext, Injectable} from "@nestjs/common";
import ApiError from "../exceptions/api-error";
import {TokenService} from "../token/token.service";
import {Request} from "express";

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(private readonly tokenService: TokenService) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request: Request = context.switchToHttp().getRequest();
        const accessToken = request.headers.authorization?.split(" ")[1];
        if (!accessToken) {
            throw ApiError.UnauthorizedError();
        }
        const userData = await this.tokenService.validateAccessToken(accessToken);
        if (!userData) {
            throw ApiError.UnauthorizedError();
        }

        request.user = userData;

        return true;
    }
}
