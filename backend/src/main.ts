import * as cookieParser from "cookie-parser";
import {NestFactory} from "@nestjs/core";
import {AppModule} from "./app.module";
import {ValidationPipe} from "@nestjs/common";
import {ExceptionsFilter} from "./exceptions/exceptions.filter";

async function bootstrap() {
    const app = await NestFactory.create(AppModule, {
        cors: {
            credentials: true,
            origin: "http://localhost:5173"
        }
    });
    app.setGlobalPrefix("api");
    app.use(cookieParser());
    app.useGlobalPipes(new ValidationPipe());
    app.useGlobalFilters(new ExceptionsFilter());
    await app.listen(3000);


    const url = new URL(await app.getUrl());
    console.log(`http://localhost:${url.port}`);
}

void bootstrap();
