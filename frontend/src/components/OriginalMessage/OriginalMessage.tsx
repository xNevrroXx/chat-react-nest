import React, {FC, useMemo} from "react";
import {Interweave} from "interweave";
import * as classNames from "classnames";
import emojiParser from "universal-emoji-parser";
import {UrlMatcher} from "interweave-autolink";
// own modules
import {checkIsMessage, FileType, IForwardedMessage, IMessage} from "../../models/IStore/IRoom.ts";
import LinkPreviewer from "../LinkPreviewer/LinkPreviewer.tsx";
import Time from "../Time/Time.tsx";
import {Typography} from "antd";

const {Paragraph} = Typography;


const OriginalMessage: FC<IMessage | IForwardedMessage> = (message) => {

    return useMemo(() => {
        const {hasRead, updatedAt, createdAt} = message;
        if (!checkIsMessage(message)) {
            return;
        }

        const {text, firstLinkInfo, files} = message;
        if (text && firstLinkInfo) {
            return (
                <Paragraph
                    style={{marginBottom: 0}}
                    className={classNames("message__wrapper-inner-content", "message__wrapper-inner-content_with-links")}
                >
                    <Interweave
                        noWrap={true}
                        content={emojiParser.parse(text)}
                        matchers={[
                            new UrlMatcher("url", {validateTLD: false})
                        ]}
                    />
                    <LinkPreviewer
                        className="message__link-previewer"
                        data={firstLinkInfo}
                    />
                    <Time hasRead={hasRead} hasEdited={!!updatedAt} createdAt={createdAt}/>
                </Paragraph>
            );
        } else if (text && !firstLinkInfo) {
            return (
                <Paragraph
                    style={{marginBottom: 0}}
                    className={"message__wrapper-inner-content"}>
                    <Interweave
                        noWrap={true}
                        content={emojiParser.parse(text)}
                    />
                    <Time hasRead={hasRead} hasEdited={!!updatedAt} createdAt={createdAt}/>
                </Paragraph>
            );
        } else if (!files.find(f => f.fileType === FileType.ATTACHMENT && !(f.mimeType.includes("video") || f.mimeType.includes("image")))) {
            return (
                <Paragraph
                    style={{marginBottom: 0}}
                    className="message__wrapper-inner-content message__wrapper-inner-content_empty">
                    <Time isMessageEmpty={true} hasRead={hasRead} hasEdited={!!updatedAt} createdAt={createdAt}/>
                </Paragraph>
            );
        }
    }, [message]);
};

export default OriginalMessage;