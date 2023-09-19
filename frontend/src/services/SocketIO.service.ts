import {io, Socket} from "socket.io-client";
import {ClientToServerEvents, ServerToClientEvents} from "../models/ISocket-io.ts";

class SocketIOService {
    public socket: Socket<ServerToClientEvents, ClientToServerEvents>;

    constructor(token: string) {
        this.socket = io(import.meta.env.VITE_BACKEND_BASE_SOCKET_URL, {
            autoConnect: false,
            transportOptions: {
                polling: {
                    extraHeaders: {
                        Authorization: `Bearer ${token}`
                    }
                }
            }
        });
    }

    async connect(): Promise<void> {
        return new Promise((resolve, reject) => {
            this.socket.on("connect", () => {
                console.log("CONNECTED");
                resolve();
            });
            this.socket.on("connect_error", (error) => {
                console.log("CONNECT ERROR: ", error);
                reject(error);
            });

            this.socket.connect();
        });
    }

    async disconnect(): Promise<void> {
        return new Promise((resolve) => {
            this.socket.on("disconnect", (reason, description) => {
                console.log("Disconnection: ", reason, description);
                this.socket.removeAllListeners();
                resolve();
            });

            this.socket.disconnect();
        });
    }

    emit<Event extends keyof ClientToServerEvents>(event: Event, data: Parameters<ClientToServerEvents[Event]>) {
        this.socket.emit(event, ...data);
        console.log("event: ", event);
        console.log("data: ", data);
    }

    on<Event extends keyof ServerToClientEvents>(event: Event, fn: ServerToClientEvents[Event]) {
        if (!this.socket) {
            return;
        }

        // @ts-ignore
        this.socket.on(event, fn);
    }
}

export {SocketIOService};