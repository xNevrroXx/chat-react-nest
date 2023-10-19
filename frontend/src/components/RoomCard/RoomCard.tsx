import React, {FC} from "react";
import * as classNames from "classnames";
import {Avatar, Typography} from "antd";
// own modules
import {IRoom} from "../../models/IStore/IChats.ts";
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
            data-list-id={room.id}
            onClick={onClick}
            className={classNames("room-card")}
        >
            <div className="room-card__left">
                <Avatar size={48} className="room-card"></Avatar>
            </div>
            <div className="room-card__right">
                <Title level={5} style={{margin: 0}}>
                    { room.name || "NAME NOT FOUND" }
                </Title>
                <Text>
                    {"НАВЕРНОЕ Был в сети недавно"}
                    {/*{ room.userOnline.isOnline*/}
                    {/*    ? "В сети"*/}
                    {/*    : "Был в сети: "*/}
                    {/*}*/}
                </Text>
            </div>
        </li>
    );
};

export default RoomCard;