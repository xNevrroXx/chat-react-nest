import {AxiosResponse} from "axios";
// own modules
import $api from "../http";
import type {TChatsResponse} from "../models/IResponse/IChatResponse.ts";

class ChatService {
    protected static base = "/chats";

    static async getAll(): Promise<AxiosResponse<TChatsResponse>> {
        return $api.get<TChatsResponse>(this.base);
    }
}

export {ChatService};