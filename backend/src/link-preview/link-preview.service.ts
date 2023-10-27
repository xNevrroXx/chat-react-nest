import {Injectable} from "@nestjs/common";
import * as cheerio from "cheerio";

@Injectable()
export class LinkPreviewService {
    async loadPage(url: string) {
        return cheerio.load(url);
    }

    getMetaTag($: cheerio.Root, name: string) {
        return (
            $(`meta[name=${name}]`).attr("content") ||
            $(`meta[propety="twitter${name}"]`).attr("content") ||
            $(`meta[property="og:${name}"]`).attr("content")
        );
    }

    generatePreviewInfo($: cheerio.Root, url: string) {
        return {
            url,
            title: this.getTitle($),
            favicon: this.getFavicon($),
            description: this.getDescription($),
            image: this.getImage($),
            author: this.getAuthor($),
        };
    }

    getTitle($: cheerio.Root) {
        return $("title").first().text();
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