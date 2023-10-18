import {Catch, ArgumentsHost, ExceptionFilter} from "@nestjs/common";
import {Response} from "express";
import ApiError from "./api-error";

@Catch()
export class ExceptionsFilter implements ExceptionFilter {
    catch(exception: ApiError, host: ArgumentsHost) {
        console.log("EXCEPTION FILTER");
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();
        const status = exception.status;

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
