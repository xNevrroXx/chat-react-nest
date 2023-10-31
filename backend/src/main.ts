import * as cookieParser from "cookie-parser";
import {NestFactory} from "@nestjs/core";
import {AppModule} from "./app.module";
import {ValidationPipe} from "@nestjs/common";
import {HttpExceptionsFilter} from "./exceptions/http-exceptions.filter";
import {SocketIoAdapter} from "./socket.adapter";
import {ConfigService} from "@nestjs/config";
import {BaseWsExceptionFilter} from "@nestjs/websockets";

async function bootstrap() {
    const app = await NestFactory.create(AppModule, {
        cors: {
            credentials: true,
            origin: "http://localhost:5173"
        }
    });
    const configService = app.get(ConfigService);
    app.setGlobalPrefix("api");
    app.use(cookieParser());
    app.useGlobalPipes(new ValidationPipe());
    app.useWebSocketAdapter(new SocketIoAdapter(app, configService));
    app.useGlobalFilters(new HttpExceptionsFilter());
    app.useGlobalFilters(new BaseWsExceptionFilter());
    await app.listen(3000); 


    const url = new URL(await app.getUrl());
    console.log(`http://localhost:${url.port}`);
}

void bootstrap();
