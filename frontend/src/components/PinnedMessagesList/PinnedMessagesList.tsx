import React, {FC} from "react";
// own modules
import PinnedMessage from "../PinnedMessage/PinnedMessage.tsx";
import {TValueOf} from "../../models/TUtils.ts";
import {IRoom} from "../../models/IStore/IRoom.ts";
// styles
import "./pinned-message-list.scss";

interface IPinnedMessagesListProps {
    pinnedMessages: TValueOf<Pick<IRoom, "pinnedMessages">>
}
const PinnedMessagesList: FC<IPinnedMessagesListProps> = ({pinnedMessages}) => {
    if (pinnedMessages.length === 0) return;

    // todo vertical slider pinned messages

    return pinnedMessages.map((pinnedMessage, index) => <PinnedMessage key={pinnedMessage.id} index={index + 1} pinnedMessage={pinnedMessage}/>);
};

export default PinnedMessagesList;