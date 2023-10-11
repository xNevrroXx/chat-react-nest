import {IUserPayloadJWT} from "../user/IUser";

declare global {
    namespace NestJS {
        export interface ExecutionContext {
            user?: IUserPayloadJWT
        }
        export interface Socket {
            user?: IUserPayloadJWT
        }
    }

    namespace SocketIO { // todo: how to properly do this one?
        export interface Socket {
            user?: IUserPayloadJWT
        }
    }

    namespace Express {
        export interface Request {
            user?: IUserPayloadJWT
        }
    }

    namespace NodeJS {
        interface ProcessEnv {
            PORT: number
            SMTP_HOST: string
            SMTP_PORT: number
            SMTP_EMAIL_ADDRESS: string
            SMTP_EMAIL_PASSWORD: string
            JWT_ACCESS_SECRET: string
            JWT_REFRESH_SECRET: string
        }
    }
}