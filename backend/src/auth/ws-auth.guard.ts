import {CanActivate, ExecutionContext, Injectable} from "@nestjs/common";
import {TokenService} from "../token/token.service";
import ApiError from "../exceptions/api-error";

@Injectable() 
export class WsAuth implements CanActivate {
  constructor(private readonly tokenService: TokenService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const client = context.switchToWs().getClient();
    const accessToken = client.handshake.headers.authorization?.split(" ")[1];
    if (!accessToken) {
      throw ApiError.UnauthorizedError();
    }
    const userData = await this.tokenService.validateAccessToken(accessToken);
    if (!userData) {
      throw ApiError.UnauthorizedError();
    }

    client.user = userData;

    return true;
  }
}
