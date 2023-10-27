import {Controller, Get, Req} from "@nestjs/common";
import {Request} from "express";
import {LinkPreviewService} from "./link-preview.service";
import axios from "axios";
import HttpError from "../exceptions/http-error";

@Controller("link-preview")
export class LinkPreviewController {
    constructor(
       private readonly linkPreviewService: LinkPreviewService
    ) {}

    @Get()
    async preview(@Req() request: Request) {
        const {url} = request.query;
        if (!url) return;

        try {
            const {data} = await axios.get(url as string);
            const page = await this.linkPreviewService.loadPage(data);
            return this.linkPreviewService.generatePreviewInfo(page, url as string);
        }
        catch (error) {
            throw HttpError.BadRequest("Сайт не найден: ", url);
        }
    }
}