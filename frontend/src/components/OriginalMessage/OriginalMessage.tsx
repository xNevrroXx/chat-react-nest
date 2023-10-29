import React, {FC, useMemo} from "react";
import {Interweave} from "interweave";
import * as classNames from "classnames";
import emojiParser from "universal-emoji-parser";
import LinkPreviewer from "../LinkPreviewer/LinkPreviewer.tsx";
import {UrlMatcher} from "interweave-autolink";
import {TValueOf} from "../../models/TUtils.ts";
import {IOriginalMessage} from "../../models/IStore/IChats.ts";

interface IOriginalMessageProps {
    text: TValueOf<Pick<IOriginalMessage, "text">>
    firstLinkInfo: TValueOf<Pick<IOriginalMessage, "firstLinkInfo">>
}
const OriginalMessage: FC<IOriginalMessageProps> = ({text, firstLinkInfo}) => {
    return useMemo(() => {
        if (text && firstLinkInfo) {
            return (
                <div
                    className={classNames("message__wrapper-inner-content", "message__wrapper-inner-content_with-links")}
                >
                    <Interweave
                        tagName="p"
                        className={classNames("message__text", "message__text_pb")}
                        content={emojiParser.parse(text)}
                        matchers={[
                            new UrlMatcher("url", {validateTLD: false})
                        ]}
                    />
                    <LinkPreviewer
                        className="message__link-previewer"
                        data={firstLinkInfo}
                    />
                </div>
            );
        } else if (text && !firstLinkInfo) {
            return (
                <div
                    className={"message__wrapper-inner-content"}
                >
                    <Interweave
                        tagName="p"
                        className="message__text"
                        content={emojiParser.parse(text)}
                    />
                </div>
            );
        }

        return null;
    }, [text, firstLinkInfo]);
};

export default OriginalMessage;