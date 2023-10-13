import React, {FC, Fragment} from "react";
import {Avatar, Typography} from "antd";
import {CheckOutlined} from "@ant-design/icons";
import * as classNames from "classnames";
// own modules
import {truncateTheText} from "../../utils/truncateTheText.ts";
// styles
import "./dialog.scss";
import {IUserDto} from "../../models/IStore/IAuthentication.ts";
import {TValueOf} from "../../models/TUtils.ts";
import {Markup} from "interweave";

const {Title, Text} = Typography;

interface IDialogProps {
    id: TValueOf<Pick<IUserDto, "id">>,
    dialogName: string,
    sender: "Вы" | string,
    text: string,
    hasRead: boolean,
    onClick: () => void,
    isActive: boolean
}

const DialogCard: FC<IDialogProps> = ({id, dialogName, sender, text, hasRead, onClick, isActive}) => {
    return (
        <li
            tabIndex={0}
            data-list-id={id}
            className={classNames("dialog", isActive && "dialog_active")}
            onClick={onClick}
        >
            <div className="dialog__left">
                <Avatar size={48} className="dialog__photo"></Avatar>
            </div>
            <div className="dialog__right">
                <Title level={5} style={{margin: 0}}>{dialogName}</Title>
                <p className="dialog__message">
                    {sender && <span>{sender + ": "}</span>}
                    <Markup content={
                        truncateTheText({
                            text: text,
                            maxLength: 35
                        })
                    } />
                </p>
            </div>
            <div className="dialog__message-status">
                { hasRead ?
                    <div className="dialog__read"><CheckOutlined/></div> :
                    <div className="dialog__not-read"></div>
                }
            </div>
        </li>
    );
};

export default DialogCard;