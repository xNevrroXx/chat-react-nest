import {CanActivate, ExecutionContext, Injectable} from "@nestjs/common";
import {AuthService} from "./auth.service";

@Injectable() 
export class WsAuth implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const client = context.switchToWs().getClient();
    client.user = await this.authService.verify(client.handshake.headers.authorization);
    return true;
  }
}
