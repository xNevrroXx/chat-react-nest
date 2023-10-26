import {Catch, ArgumentsHost, ExceptionFilter} from "@nestjs/common";
import {Response} from "express";
import HttpError from "./http-error";

@Catch(HttpError)
export class HttpExceptionsFilter implements ExceptionFilter {
    catch(exception: HttpError, host: ArgumentsHost) {
        console.log("EXCEPTION FILTER", exception.message);
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();
        const status = exception.getStatus();

        response
            .status(status)
            .json({
                message: exception.message,
                statusCode: status,
                timestamp: new Date().toISOString(),
                path: request.url,
            });
    }
}
