type Errors = Error[];

class ApiError extends Error {
    status: number;
    errors: Errors;
    constructor(status: number, message: string, errors: Errors = []) {
        super(message);
        this.status = status;
        this.errors = errors;
    }

    static BadRequest(message: string, errors: Errors = []) {
        return new ApiError(400, message, errors);
    }

    static Conflict(message: string) {
        return new ApiError(409, message);
    }

    static UnauthorizedError() {
        return new ApiError(401, "Пользователь не авторизован");
    }

    static AccessDenied() {
        return new ApiError(403, "Нет доступа к этому ресурсу");
    }
}

export default ApiError;