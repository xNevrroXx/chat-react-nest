import React, {FC, Fragment} from "react";
import {Flex, Typography} from "antd";
import * as classNames from "classnames";
import {Interweave} from "interweave";
// own modules
import {messageOwnerSelector} from "../../store/selectors/messageOwnerSelector.ts";
import {
    IInnerMessage,
    IInnerForwardedMessage, checkIsInnerMessage
} from "../../models/IStore/IChats.ts";
// selectors
import {useAppSelector} from "../../hooks/store.hook.ts";
// styles
import "./message-reply.scss";

const {Text} = Typography;

type TMessageReplyProps = {
    message: IInnerMessage | IInnerForwardedMessage;
    isInput?: boolean;
}
const MessageReply: FC<TMessageReplyProps> = ({message, isInput}) => {
    const ownerMessage = useAppSelector(state => messageOwnerSelector(state, message));

    return (
        <Flex
            component="a"
            // @ts-ignore
            href={"#".concat(message.id)}
            className={classNames("message-reply", isInput && "message-reply_input")}
            vertical
            data-reply-message-id={message.id}
        >
            {ownerMessage &&
                <Text strong>{ownerMessage.name.concat(" ").concat(ownerMessage.surname)}</Text>
            }

            {checkIsInnerMessage(message) ?
                <Fragment>
                    {message.files && message.files.length > 0 &&
                        <Text italic>вложения: {message.files.length}</Text>
                    }

                    {message.text &&
                        <Interweave
                            className="ant-typography css-dev-only-do-not-override-3mqfnx"
                            tagName="span"
                            content={message.text}
                        />
                    }
                </Fragment>
                :
                <Fragment>
                    <Text>1 пересланное сообщение</Text>
                </Fragment>
            }
        </Flex>
    );
};

export default MessageReply;