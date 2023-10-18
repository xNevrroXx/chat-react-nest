import React, {FC} from "react";
import * as classNames from "classnames";
import {Avatar, Typography} from "antd";
// own modules
import {IUserDto} from "../../models/IStore/IAuthentication.ts";
// styles
import "./user-card.scss";

const {Title, Text} = Typography;

interface IUserCardProps {
    user: IUserDto;
    onClick: () => void
}

const UserCard:FC<IUserCardProps> = ({user, onClick}) => {
    return (
        <li
            tabIndex={0}
            data-list-id={user.id}
            onClick={onClick}
            className={classNames("user-card")}
        >
            <div className="user-card__left">
                <Avatar size={48} className="user-card"></Avatar>
            </div>
            <div className="user-card__right">
                <Title level={5} style={{margin: 0}}>
                    { user.name.concat(" ").concat(user.surname) }
                </Title>
                <Text>
                    { user.userOnline.isOnline
                        ? "В сети"
                        : "Был в сети: "
                    }
                </Text>
            </div>
        </li>
    );
};

export default UserCard;