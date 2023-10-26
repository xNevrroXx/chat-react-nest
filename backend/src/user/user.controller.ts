import * as bcrypt from "bcrypt";
import {Body, Controller, Get, Post, Req, Res, UseFilters, UseGuards} from "@nestjs/common";
import {UserDto, UserLogin, UserRegister} from "./userDto";
import {UserService} from "./user.service";
import {TokenService} from "../token/token.service";
import HttpError from "../exceptions/http-error";
import {AuthGuard} from "../auth/auth.guard";
import {excludeSensitiveFields} from "../utils/excludeSensitiveFields";
import {Request, Response} from "express";
import {isUserWithRefreshToken, IUserPayloadJWT} from "./IUser";

@Controller("user")
export class UserController {
    constructor(
        private readonly userService: UserService,
        private readonly tokenService: TokenService
    ) {}

    @Post("register")
    async register(@Res() response, @Body() user: UserRegister) {
        const hashPassword = await bcrypt.hash(user.password, 3);
        const newUser = await this.userService.create({
            ...user,
            password: hashPassword
        });
        const {accessToken, refreshToken} = await this.tokenService.generateTokens({
            id: newUser.id,
            name: newUser.name
        });
        await this.tokenService.saveRefreshToken(newUser.id, refreshToken);

        const userDto = new UserDto(newUser);
        response.cookie("refreshToken", refreshToken, {maxAge: 1000*60*60*24, httpOnly: true});
        return {
            accessToken,
            user: userDto
        };
    }

    @Post("login")
    async login(@Res({passthrough: true}) response, @Body() {email, password}: UserLogin) {
        const targetUser = await this.userService.findOne({email});
        if (!targetUser) {
            throw HttpError.BadRequest(`Пользователя с почтовым адресом ${email} не существует`);
        }
        const isPasswordEquals = await bcrypt.compare(password, targetUser.password);
        if (!isPasswordEquals) {
            response.cookie("refreshToken", "", {maxAge: 0, httpOnly: true});
            throw HttpError.BadRequest("Пароль неверный");
        }
        const {accessToken, refreshToken} = await this.tokenService.generateTokens({
            id: targetUser.id,
            name: targetUser.name
        });
        await this.tokenService.saveRefreshToken(targetUser.id, refreshToken);

        const userDto = new UserDto(targetUser);
        response.cookie("refreshToken", refreshToken, {maxAge: 1000*60*60*24, httpOnly: true});
        return {
            accessToken,
            user: userDto
        };
    }

    @Post("logout")
    @UseGuards(AuthGuard)
    async logout(@Res({passthrough: true}) response: Response, @Req() request: Request) {
        const targetUser = await this.userService.findOne({
            id: request.user.id
        });
        if (!targetUser) {
            throw HttpError.UnauthorizedError();
        }
        await this.tokenService.removeRefreshToken(targetUser.id);

        response.clearCookie("refreshToken");
        return;
    }

    @Get("refresh")
    async refresh(@Req() request: Request, @Res({passthrough: true}) response: Response) {
        const {refreshToken: oldRefreshToken} = request.cookies;
        const userPayload: IUserPayloadJWT = await this.tokenService.validateRefreshToken(oldRefreshToken);
        if (!userPayload) {
            throw HttpError.UnauthorizedError();
        }

        const targetUser = await this.userService.findOne(
            {id: userPayload.id},
            {refreshToken: true}
        );
        if (!isUserWithRefreshToken(targetUser) || targetUser.refreshToken.token !== oldRefreshToken) {
            response.clearCookie("refreshToken");
            throw HttpError.UnauthorizedError();
        }

        const {accessToken, refreshToken} = await this.tokenService.generateTokens({
            id: targetUser.id,
            name: targetUser.name
        });
        await this.tokenService.saveRefreshToken(targetUser.id, refreshToken);

        const userDto = new UserDto(targetUser);
        response.cookie("refreshToken", refreshToken, {maxAge: 1000*60*60*24, httpOnly: true});
        return {
            accessToken,
            user: userDto
        };

    }

    @Get("all")
    @UseGuards(AuthGuard)
    async getAll(@Req() request: Request) {
        const users = await this.userService.findMany({
            where: {
                NOT: {
                    id: request.user.id
                }
            },
            include: {
                userOnline: true
            }
        });

        return {
            users: users.map(user => excludeSensitiveFields(user, ["password"]))
        };
    }
}
