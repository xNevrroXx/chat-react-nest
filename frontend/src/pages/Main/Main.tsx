import {Fragment, useEffect, useState} from "react";
import {Modal} from "antd";
// own modules
import {ROUTES} from "../../router/routes.ts";
import {useAppDispatch, useAppSelector} from "../../hooks/store.hook.ts";
import {createRoute} from "../../router/createRoute.ts";
import Users from "../../modules/Users/Users.tsx";
import Dialogs from "../../modules/Dialogs/Dialogs.tsx";
import ChatContent from "../../modules/ChatContent/ChatContent.tsx";
// selectors & actions
import {userDialogsSelector} from "../../store/selectors/userDialogs.ts";
import {forwardMessageSocket} from "../../store/thunks/chat.ts";
// own types
import type {IChat, TForwardMessage} from "../../models/IStore/IChats.ts";
import type {IUserDto} from "../../models/IStore/IAuthentication.ts";
// styles
import "./main.scss";
import {TValueOf} from "../../models/TUtils.ts";
import {useNavigate} from "react-router-dom";

export interface IActiveDialog {
    interlocutor: IUserDto,
    chat: IChat
}

const Main = () => {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const user = useAppSelector(state => state.authentication.user!);
    const [userDialogs, firstUser, users] = useAppSelector(userDialogsSelector);
    const [activeDialog, setActiveDialog] = useState<IActiveDialog | null>(null);
    const [isOpenModalForForwardMessage, setIsOpenModalForForwardMessage] = useState<boolean>(false);
    const [forwardedMessageId, setForwardedMessageId] = useState<TValueOf<Pick<TForwardMessage, "forwardedMessageId">> | null>(null);

    useEffect(() => {
        if (!user) {
            navigate(createRoute({path: ROUTES.AUTH}));
        }
    }, [user, dispatch]);

    useEffect(() => {
        // set the first found chat as an active one
        let isFoundChat = false;
        for (const [interlocutor, chat] of userDialogs.entries()) {
            if (!chat) {
                continue;
            }

            isFoundChat = true;
            setActiveDialog({interlocutor, chat});
            break;
        }
        if (!isFoundChat) {
            setActiveDialog(firstUser ? {
                interlocutor: firstUser,
                chat: {
                    isTyping: false,
                    userId: firstUser.id,
                    messages: []
                }
            } : null);
        }
    }, [userDialogs, firstUser]);

    const onChangeDialog = (dialog: typeof activeDialog) => {
        setActiveDialog(dialog);
    };

    const onClickUser = (user: IUserDto) => {
        setIsOpenModalForForwardMessage(false);
        if (!forwardedMessageId) {
            return;
        }

        void dispatch(
            forwardMessageSocket({
                interlocutorId: user.id,
                forwardedMessageId: forwardedMessageId
            })
        );
    };
    const openUsersListForForwardMessage = (forwardedMessageId: TValueOf<Pick<TForwardMessage, "forwardedMessageId">>) => {
        setForwardedMessageId(forwardedMessageId);
        setIsOpenModalForForwardMessage(true);
    };

    return (
        <Fragment>
            <div className="messenger">
                <Dialogs
                    user={user}
                    userDialogs={userDialogs}
                    onChangeDialog={onChangeDialog}
                    activeChatId={activeDialog ? activeDialog.interlocutor.id : null}
                />
                { activeDialog &&
                    <ChatContent
                        dialog={activeDialog}
                        user={user}
                        onOpenUsersListForForwardMessage={openUsersListForForwardMessage}
                    />
                }
            </div>
            <Modal
                open={isOpenModalForForwardMessage}
            >
                <Users users={users} onClickUser={onClickUser}/>
            </Modal>
        </Fragment>
    );
};

export default Main;