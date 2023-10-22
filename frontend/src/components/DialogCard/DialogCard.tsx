import React, {FC} from "react";
import {Avatar, Typography} from "antd";
import {CheckOutlined} from "@ant-design/icons";
import * as classNames from "classnames";
import {Markup} from "interweave";
// own modules
import {truncateTheText} from "../../utils/truncateTheText.ts";
import {IUserDto} from "../../models/IStore/IAuthentication.ts";
import {TValueOf} from "../../models/TUtils.ts";
import {IRoom, RoomType} from "../../models/IStore/IChats.ts";
import {ILastMessageInfo} from "../../models/IChat.ts";
// styles
import "./dialog.scss";

const {Title} = Typography;

interface IDialogCardProps {
    id: TValueOf<Pick<IUserDto, "id">>,
    dialogName: string,
    onClick: () => void,
    isActive: boolean,
    lastMessageInfo: ILastMessageInfo | null,
    roomType: TValueOf<Pick<IRoom, "roomType">>
}

const DialogCard: FC<IDialogCardProps> = ({id, dialogName, lastMessageInfo, onClick, isActive, roomType}) => {
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
                {lastMessageInfo &&
                    (
                        <p className="dialog__message">
                            {roomType === RoomType.GROUP && <span>{lastMessageInfo.sender + ": "}</span>}
                            <Markup content={
                                truncateTheText({
                                    text: lastMessageInfo.text,
                                    maxLength: 35
                                })
                            } />
                        </p>
                    )
                }
            </div>
            {lastMessageInfo && lastMessageInfo.sender !== "Вы" &&
                (
                    <div className="dialog__message-status">
                        { lastMessageInfo.hasRead ?
                            <div className="dialog__read"><CheckOutlined/></div> :
                            <div className="dialog__not-read"></div>
                        }
                    </div>
                )
            }
        </li>
    );
};

export default DialogCard;