import {FC, useCallback, useMemo} from "react";
// own modules
import DialogCard from "../DialogCard/DialogCard.tsx";
// types
import {checkIsMessage, IRoom} from "../../models/IStore/IRoom.ts";
import {TValueOf} from "../../models/TUtils.ts";
import {IUserDto} from "../../models/IStore/IAuthentication.ts";
import {ILastMessageInfo} from "../../models/IRoom.ts";
// styles
import "./list-dialogs.scss";

interface IDialogsProps {
    user: IUserDto,
    rooms: IRoom[],
    activeRoomId: TValueOf<Pick<IRoom, "id">> | null,
    onClickDialog: (roomId: TValueOf<Pick<IRoom, "id">>) => void,
}

const ListDialogs: FC<IDialogsProps> = ({user, rooms, onClickDialog, activeRoomId}) => {
    const findLastMessageInfo = useCallback((room: IRoom): ILastMessageInfo | null => {
        const lastMessage = room.messages ? room.messages.at(-1) : null;
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
                    onClick={() => onClickDialog(room.id)}
                    dialogName={room.name}
                    isActive={activeRoomId === room.id}
                    lastMessageInfo={lastMessageInfo}
                    roomType={room.roomType}
                />
            );
        });
    }, [rooms, activeRoomId, onClickDialog, findLastMessageInfo]);

    return (
        <ul className="dialogs__list">
            {list}
        </ul>
    );
};

export default ListDialogs;