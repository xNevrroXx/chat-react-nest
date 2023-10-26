import {FC, useCallback, useMemo} from "react";
import {Input, Typography} from "antd";
// own modules
import DialogCard from "../../components/DialogCard/DialogCard.tsx";
// types
import {checkIsMessage, IRoom} from "../../models/IStore/IChats.ts";
import {TValueOf} from "../../models/TUtils.ts";
import {IUserDto} from "../../models/IStore/IAuthentication.ts";
import {ILastMessageInfo} from "../../models/IChat.ts";
// styles
import "./dialogs.scss";

const {Title} = Typography;

interface IDialogsProps {
    user: IUserDto,
    rooms: IRoom[],
    activeChatId: TValueOf<Pick<IRoom, "id">> | null,
    onChangeDialog: (roomId: TValueOf<Pick<IRoom, "id">>) => void,
}

const Dialogs: FC<IDialogsProps> = ({user, rooms, onChangeDialog, activeChatId}) => {
    const findLastMessageInfo = useCallback((room: IRoom): ILastMessageInfo | null => {
        const lastMessage = room.messages.at(-1);
        if (!lastMessage) {
            return null;
        }

        const sender = lastMessage.senderId === user.id
            ? "Вы"
            : room.participants.find(participant => participant.userId === lastMessage.senderId)!.nickname;
        let text: string;
        if (!lastMessage.text) {
            if (checkIsMessage(lastMessage)) {
                text = "вложения - " + lastMessage.files.length.toString();
            }
            text = "пересланное сообщение";
        }
        else {
            text = lastMessage.text;
        }

        return {
            text,
            sender,
            hasRead: lastMessage.hasRead
        };
    }, [user]);

    const list = useMemo(() => {
        return rooms.map(room => {
            const lastMessageInfo = findLastMessageInfo(room);

            return (
                <DialogCard
                    key={room.id.toString() + "dialog card"}
                    id={room.id}
                    onClick={() => onChangeDialog(room.id)}
                    dialogName={room.name}
                    isActive={activeChatId === room.id}
                    lastMessageInfo={lastMessageInfo}
                    roomType={room.roomType}
                />
            );
        });
    }, [rooms, activeChatId, onChangeDialog, findLastMessageInfo]);

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