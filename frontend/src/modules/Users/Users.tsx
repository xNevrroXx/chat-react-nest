import React, {FC, useMemo} from "react";
// own modules
import RoomCard from "../../components/RoomCard/RoomCard.tsx";
import {IRoom} from "../../models/IStore/IChats.ts";

interface IUsersProps {
    rooms: IRoom[];
    onClickRoom: (room: IRoom) => void;
}

const Users: FC<IUsersProps> = ({rooms, onClickRoom}) => {

    const list = useMemo(() => {
        return rooms.map(room =>
            <RoomCard
                key={room.id}
                room={room}
                onClick={() => onClickRoom(room)}
            />
        );
    }, [rooms, onClickRoom]);

    return (
        <ul className="users__list">
            {list}
        </ul>
    );
};

export default Users;