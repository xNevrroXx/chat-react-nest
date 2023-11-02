import * as jwt from "jsonwebtoken";
import {Injectable} from "@nestjs/common";
import {DatabaseService} from "../database/database.service";
import type {IUserPayloadJWT} from "../user/IUser";
import type {TValueOf} from "../models/TUtils";

@Injectable()
export class TokenService {
    constructor(protected readonly prisma: DatabaseService) {}

    async generateTokens(payload: IUserPayloadJWT) {
        const accessToken = jwt.sign(payload, process.env.JWT_ACCESS_SECRET, {expiresIn: "30m"});
        const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {expiresIn: "30d"});

        return {
            accessToken,
            refreshToken
        };
    }

    async validateAccessToken(token: string) {
        try {
            const validationResult: IUserPayloadJWT = await jwt.verify(token, process.env.JWT_ACCESS_SECRET);
            return validationResult;
        } catch {
            return null;
        }
    }

    async validateRefreshToken(token: string) {
        try {
            const validationResult: IUserPayloadJWT = await jwt.verify(token, process.env.JWT_REFRESH_SECRET);
            return validationResult;
        } catch {
            return null;
        }
    }

    async saveRefreshToken(userId: TValueOf<Pick<IUserPayloadJWT, "id">>, token: string) {

        return this.prisma.refreshToken.upsert({
            where: {
                userId
            },
            create: {
                userId,
                token
            },
            update: {
                token
            }
        });
    }

    async removeRefreshToken(userId: TValueOf<Pick<IUserPayloadJWT, "id">>) {
        return this.prisma.refreshToken.delete({
            where: {userId}
        });
    }
}
