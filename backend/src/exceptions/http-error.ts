import {HttpException, HttpStatus} from "@nestjs/common";
import {HttpExceptionOptions} from "@nestjs/common/exceptions/http.exception";


class HttpError extends HttpException {
    constructor(response: string | Record<string, any>, status: number, options?: HttpExceptionOptions) {
        super(response, status, options);
    }

    static BadRequest(message: string, error?: unknown) {
        return new HttpError({
                status: HttpStatus.BAD_REQUEST,
                error: message
            }, HttpStatus.BAD_REQUEST,
            {
                cause: error
            });
    }

    static Conflict(message: string) {
        return new HttpError({
                status: HttpStatus.CONFLICT,
                error: message
            }, HttpStatus.CONFLICT);
    }

    static UnauthorizedError() {
        return new HttpError({
                status: HttpStatus.UNAUTHORIZED,
                error: "Пользователь не авторизован"
            }, HttpStatus.UNAUTHORIZED);
    }

    static AccessDenied() {
        return new HttpError({
                status: HttpStatus.FORBIDDEN,
                error: "Нет доступа к этому ресурсу"
            }, HttpStatus.FORBIDDEN);
    }

    static InternalServerError(message?: string) {
        return new HttpError({
            status: HttpStatus.INTERNAL_SERVER_ERROR,
            error: message || "Непредвиденная ошибка"
        }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
}

export default HttpError;