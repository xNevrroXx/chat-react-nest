import {Injectable} from "@nestjs/common";
import * as cheerio from "cheerio";
import axios from "axios";
import HttpError from "../exceptions/http-error";

@Injectable()
export class LinkPreviewService {
    async getLinkInfo(url: string) {
        try {
            const {data} = await axios.get(url as string);
            const page = await this.loadPage(data);
            return await this.generatePreviewInfo(page, url as string);
        }
        catch (error) {
            throw HttpError.BadRequest("Информация о ссылке не найдена: ", url);
        }
    }

    async loadPage(url: string) {
        return cheerio.load(url);
    }

    async generatePreviewInfo($: cheerio.Root, url: string) {
        const data = {
            url,
            title: this.getTitle($),
            shortTitle: await this.getShortTitle($, url),
            favicon: this.getFavicon($),
            description: this.getDescription($),
            image: this.getImage($),
            author: this.getAuthor($),
        };

        return {
            url: data.url.trim(),
            title: data.title && data.title.trim(),
            shortTitle: data.shortTitle && data.shortTitle.trim(),
            favicon: data.favicon && data.favicon.trim(),
            description: data.description && data.description.trim(),
            image: data.image && data.image.trim(),
            author: data.author && data.author.trim(),
        };
    }

    getMetaTag($: cheerio.Root, name: string) {
        return (
            $(`meta[name=${name}]`).attr("content") ||
            $(`meta[propety="twitter${name}"]`).attr("content") ||
            $(`meta[property="og:${name}"]`).attr("content")
        );
    }

    getTitle($: cheerio.Root) {
        return this.getMetaTag($, "title") || $("title").first().text();
    }

    async getShortTitle($: cheerio.Root, url: string): Promise<string | undefined> {
        const searchXmlFileUrlPath = $("link[rel='search']").attr("href");
        if (!searchXmlFileUrlPath) return;

        const searchXmlFileUrl = new URL(url);
        searchXmlFileUrl.pathname = searchXmlFileUrlPath;

        const {data} = await axios.get(searchXmlFileUrl.href);
        const page = await this.loadPage(data);
        return page("ShortName").text();
    }

    getFavicon($: cheerio.Root) {
        return $("link[rel='icon']").attr("href") || $("link[rel='shortcut icon']").attr("href") || $("link[rel='alternate icon']").attr("href");
    }

    getDescription($: cheerio.Root) {
        return this.getMetaTag($, "description");
    }

    getImage($: cheerio.Root) {
        return this.getMetaTag($, "image");
    }

    getAuthor($: cheerio.Root) {
        return this.getMetaTag($, "author");
    }
}