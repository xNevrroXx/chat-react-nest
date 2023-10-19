import {FC, useMemo} from "react";
import {Input, Typography} from "antd";
// own modules
import DialogCard from "../../components/DialogCard/DialogCard.tsx";
// types
import {IRoom, Message} from "../../models/IStore/IChats.ts";
import {TValueOf} from "../../models/TUtils.ts";
import {IUserDto} from "../../models/IStore/IAuthentication.ts";
// styles
import "./dialogs.scss";

const {Title} = Typography;

interface IDialogsProps {
    user: IUserDto,
    rooms: IRoom[],
    activeChatId: TValueOf<Pick<IRoom, "id">> | null,
    onChangeDialog: (room: IRoom) => void,
}

const Dialogs: FC<IDialogsProps> = ({user, rooms, onChangeDialog, activeChatId}) => {
    const list = useMemo(() => {
        return rooms.map(room => {
            const lastMessageSender = room.messages.at(-1)!.senderId === user.id ? "Вы" : (room.name || "participants!!!");
            const lastMessage = room.messages.at(-1);

            return (
                <DialogCard
                    key={room.id.toString() + "dialog card"}
                    id={room.id}
                    onClick={() => onChangeDialog(room)}
                    dialogName={room.name || "NOT FOUND NAME"}
                    sender={lastMessageSender}
                    hasRead={lastMessage!.hasRead}
                    text={lastMessage instanceof Message && lastMessage.text || ""}
                    isActive={activeChatId === room.id}
                />
            );
        });
    }, [user, rooms, onChangeDialog, activeChatId]);

    return (
        <div className="dialogs">
            <div className="dialogs__header">
                <Title level={4}>Диалоги</Title>
                <Input placeholder={"поиск..."}/>
            </div>
            <ul className="dialogs__list">
                {list}
            </ul>
        </div>
    );
};

export default Dialogs;