import React, {FC, useMemo} from "react";
import {Typography, theme} from "antd";
import {Interweave} from "interweave";
import * as classNames from "classnames";
import emojiParser from "universal-emoji-parser";
import {UrlMatcher} from "interweave-autolink";
// own modules
import {TValueOf} from "../../models/TUtils.ts";
import {IOriginalMessage} from "../../models/IStore/IRoom.ts";
import LinkPreviewer from "../LinkPreviewer/LinkPreviewer.tsx";

const {useToken} = theme;
const {Text} = Typography;

interface IOriginalMessageProps {
    text: TValueOf<Pick<IOriginalMessage, "text">>
    firstLinkInfo: TValueOf<Pick<IOriginalMessage, "firstLinkInfo">>,
    createdAt: TValueOf<Pick<IOriginalMessage, "createdAt">>
}
const OriginalMessage: FC<IOriginalMessageProps> = ({text, firstLinkInfo, createdAt}) => {
    const {token} = useToken();

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
                    <Text style={{color: token.colorTextSecondary}} className="message__time">{createdAt}</Text>
                </div>
            );
        } else if (text && !firstLinkInfo) {
            return (
                <div className={"message__wrapper-inner-content"}>
                    <Interweave
                        tagName="p"
                        className="message__text"
                        content={emojiParser.parse(text)}
                    />
                    <Text style={{color: token.colorTextSecondary}} className="message__time">{createdAt}</Text>
                </div>
            );
        }

        return null;
    }, [text, firstLinkInfo, createdAt, token.colorTextSecondary]);
};

export default OriginalMessage;