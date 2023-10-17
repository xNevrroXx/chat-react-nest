import {FC} from "react";
import {Flex, Typography} from "antd";
import {useAppSelector} from "../../hooks/store.hook.ts";
import * as classNames from "classnames";
// own modules
import {messageOwnerSelector} from "../../store/selectors/messageOwner.ts";
import {ForwardedMessage as ForwardedMessageClass} from "../../models/IStore/IChats.ts";
// styles
import "./forwarded-message.scss";

const {Text} = Typography;

type TMessageReplyProps = {
    message: ForwardedMessageClass;
    side: "left" | "right";
}
const ForwardedMessage: FC<TMessageReplyProps> = ({message, side}) => {
    const ownerMessage = useAppSelector(state => messageOwnerSelector(state, message.forwardedMessage));

    return (
        <Flex
            vertical
            className={classNames("forwarded-message", side === "right" && "forwarded-message_right")}
            data-forwarded-message-id={message.id}
        >
            {ownerMessage &&
                <Text strong>{ownerMessage.name.concat(" ").concat(ownerMessage.surname)}</Text>
            }

            <a
                href={"#".concat(message.forwardedMessage.id)}
            >
                пересланное сообщение
            </a>
        </Flex>
    );
};

export default ForwardedMessage;