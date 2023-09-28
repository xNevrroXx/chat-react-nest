import {FC, useMemo} from "react";
import {Input, Typography} from "antd";
// own modules
import DialogCard from "../../components/DialogCard/DialogCard.tsx";
// types
import {IChat} from "../../models/IStore/IChats.ts";
import {TValueOf} from "../../models/TUtils.ts";
import {TUserDialogs} from "../../store/selectors/userDialogs.ts";
import {IUserDto} from "../../models/IStore/IAuthentication.ts";
import {IActiveDialog} from "../../pages/Main/Main.tsx";
// styles
import "./dialogs.scss";

const {Title} = Typography;

interface IDialogsProps {
    user: IUserDto,
    userDialogs: TUserDialogs,
    activeChatId: TValueOf<Pick<IChat, "userId">> | null,
    onChangeDialog: (dialog: IActiveDialog) => void,
}

const Dialogs: FC<IDialogsProps> = ({user, userDialogs, onChangeDialog, activeChatId}) => {
    const list = useMemo(() => {
        const elems: JSX.Element[] = [];
        for (const [interlocutor, chat] of userDialogs.entries()) {
            if (!chat) {
                elems.push(
                    <DialogCard
                        key={interlocutor.id.toString() + "dialog"}
                        id={interlocutor.id}
                        onClick={() => onChangeDialog({
                            interlocutor,
                            chat: {
                                userId: interlocutor.id,
                                messages: []
                            }
                        })}
                        dialogName={interlocutor.name + " " + interlocutor.surname}
                        sender={""}
                        hasRead={true}
                        text={""}
                        isActive={activeChatId === interlocutor.id}
                    />
                );

                continue;
            }

            const lastMessageSender = chat.messages.at(-1)!.senderId === user.id ? "Вы" : interlocutor.name;
            elems.push(
                <DialogCard
                    key={interlocutor.id.toString() + "dialog"}
                    id={interlocutor.id}
                    onClick={() => onChangeDialog({interlocutor, chat})}
                    dialogName={interlocutor.name + " " + interlocutor.surname}
                    sender={lastMessageSender}
                    hasRead={chat.messages.at(-1)!.hasRead}
                    text={chat.messages.at(-1)!.text}
                    isActive={activeChatId === interlocutor.id}
                />
            );
        }

        return elems;
    }, [user, userDialogs, onChangeDialog, activeChatId]);

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