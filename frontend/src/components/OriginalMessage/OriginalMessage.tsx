import React, {FC, useMemo} from "react";
import {Interweave} from "interweave";
import * as classNames from "classnames";
import emojiParser from "universal-emoji-parser";
import LinkPreviewer from "../LinkPreviewer/LinkPreviewer.tsx";
import {UrlMatcher} from "interweave-autolink";

interface IOriginalMessageProps {
    text: string | null | undefined;
    links: string[] | [];
}
const OriginalMessage: FC<IOriginalMessageProps> = ({text, links}) => {
    return useMemo(() => {
        if (text && links.length > 0) {
            return (
                <div
                    className={classNames("message__wrapper-inner-content", "message__wrapper-inner-content_with-links")}
                >
                    <Interweave
                        tagName="p"
                        className={classNames("message__text", links.length > 0 && "message__text_pb")}
                        content={emojiParser.parse(text)}
                        matchers={[
                            new UrlMatcher("url", {validateTLD: false})
                        ]}
                    />
                    <LinkPreviewer
                        className="message__link-previewer"
                        href={links[0]}
                    />
                </div>
            );
        } else if (text && links.length === 0) {
            return (
                <div
                    className={"message__wrapper-inner-content"}
                >
                    <Interweave
                        tagName="p"
                        className={classNames("message__text", links.length > 0 && "message__text_pb")}
                        content={emojiParser.parse(text)}
                    />
                </div>
            );
        }

        return null;
    }, [text, links]);
};

export default OriginalMessage;