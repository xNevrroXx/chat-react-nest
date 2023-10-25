import React, {FC} from "react";
import * as classNames from "classnames";
import {Avatar, Typography} from "antd";
// own modules
import {IRoom, RoomType} from "../../models/IStore/IChats.ts";
// styles
import "./room-card.scss";

const {Title, Text} = Typography;

interface IUserCardProps {
    room: IRoom;
    onClick: () => void
}

const RoomCard:FC<IUserCardProps> = ({room, onClick}) => {
    return (
        <li
            tabIndex={0}
            onClick={onClick}
            className={classNames("room-card")}
        >
            <div className="room-card__left">
                <Avatar size={48} className="room-card__photo">
                    { room.roomType === RoomType.PRIVATE
                        ? room.name[0] + room.name.split(" ")[1][0]
                        : room.name.slice(0, 1)
                    }
                </Avatar>
            </div>
            <div className="room-card__right">
                <Title level={5} style={{margin: 0}}>
                    { room.name}
                </Title>
                <Text>
                    { room.roomType === RoomType.GROUP
                        ? "Группа"
                        : room.participants[0].isOnline
                            ? "В сети" : "Не в сети"
                    }
                </Text>
            </div>
        </li>
    );
};

export default RoomCard;