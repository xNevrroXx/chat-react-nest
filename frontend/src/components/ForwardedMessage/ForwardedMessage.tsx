import {FC} from "react";
import {Flex, Typography} from "antd";
import {useAppSelector} from "../../hooks/store.hook.ts";
import * as classNames from "classnames";
// own modules
import {messageOwnerSelector} from "../../store/selectors/messageOwnerSelector.ts";
import {IForwardedMessage} from "../../models/IStore/IRoom.ts";
// styles
import "./forwarded-message.scss";

const {Text} = Typography;

type TMessageReplyProps = {
    message: IForwardedMessage;
    isMine: boolean;
}
const ForwardedMessage: FC<TMessageReplyProps> = ({message, isMine}) => {
    const ownerMessage = useAppSelector(state => messageOwnerSelector(state, message.forwardedMessage));

    return (
        <Flex
            vertical
            className={classNames("forwarded-message", isMine && "forwarded-message_mine")}
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