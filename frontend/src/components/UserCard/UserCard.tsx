import React, {FC} from "react";
import * as classNames from "classnames";
import {Avatar, Typography} from "antd";
import {TValueOf} from "../../models/TUtils.ts";
import {IUserDto} from "../../models/IStore/IAuthentication.ts";

const {Title} = Typography;

interface IUserCardProps {
    id: TValueOf<Pick<IUserDto, "id">>,
    dialogName: string,
    onClick: () => void
}

const UserCard:FC<IUserCardProps> = ({id, dialogName, onClick}) => {
    return (
        <li
            tabIndex={0}
            data-list-id={id}
            className={classNames("dialog")}
            onClick={onClick}
        >
            <div className="dialog__left">
                <Avatar size={48} className="dialog__photo"></Avatar>
            </div>
            <div className="dialog__right">
                <Title level={5} style={{margin: 0}}>{dialogName}</Title>
            </div>
        </li>
    );
};

export default UserCard;