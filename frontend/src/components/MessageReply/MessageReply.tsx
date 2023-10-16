import {FC} from "react";
import {Flex, Typography} from "antd";
import {useAppSelector} from "../../hooks/store.hook.ts";
import * as classNames from "classnames";
// own modules
import {messageOwnerSelector} from "../../store/selectors/messageOwner.ts";
import {truncateTheText} from "../../utils/truncateTheText.ts";
import {IMessage} from "../../models/IStore/IChats.ts";
// styles
import "./message-reply.scss";

const {Text} = Typography;

type TMessageReplyProps = {
    message: IMessage;
    isInput?: boolean
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

            {message.files && message.files.length > 0 &&
                <Text italic>вложения: {message.files.length}</Text>
            }

            {message.text &&
                <Text>
                    {truncateTheText({
                        text: message.text,
                        maxLength: 35
                    })}
                </Text>
            }
        </Flex>
    );
};

export default MessageReply;