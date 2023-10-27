import axios, {AxiosResponse} from "axios";
import {ILinkPreviewInfoResponse} from "../models/IResponse/ILinkPreviewInfoResponse.ts";
import {API_URL} from "../http";

class LinkPreviewService {
    protected static base = "/link-preview";

    static async get(): Promise<AxiosResponse<ILinkPreviewInfoResponse>> {
        return axios.get<ILinkPreviewInfoResponse>(API_URL + "/" + this.base);
    }
}

export {LinkPreviewService};