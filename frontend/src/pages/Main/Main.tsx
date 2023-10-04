import {useEffect, useState} from "react";
// own modules
import {ROUTES} from "../../router/routes.ts";
import {useAppDispatch, useAppSelector} from "../../hooks/store.hook.ts";
import {createRoute} from "../../router/createRoute.ts";
import Dialogs from "../../modules/Dialogs/Dialogs.tsx";
import ChatContent from "../../modules/ChatContent/ChatContent.tsx";
// selectors
import {userDialogsSelector} from "../../store/selectors/userDialogs.ts";
// own types
import type {IChat} from "../../models/IStore/IChats.ts";
import type {IUserDto} from "../../models/IStore/IAuthentication.ts";
// styles
import "./main.scss";

export interface IActiveDialog {
    interlocutor: IUserDto,
    chat: IChat
}

const Main = () => {
    const dispatch = useAppDispatch();
    const user = useAppSelector(state => state.authentication.user!);
    const [userDialogs, firstUser] = useAppSelector(userDialogsSelector);
    const [activeDialog, setActiveDialog] = useState<IActiveDialog | null>(null);

    useEffect(() => {
        if (!user) {
            createRoute({path: ROUTES.AUTH});
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
                    userId: firstUser.id,
                    messages: []
                }
            } : null);
        }
    }, [userDialogs, firstUser]);

    const onChangeDialog = (dialog: typeof activeDialog) => {
        setActiveDialog(dialog);
    };

    return (
        <div className="messenger">
            <Dialogs
                user={user}
                userDialogs={userDialogs}
                onChangeDialog={onChangeDialog}
                activeChatId={activeDialog ? activeDialog.interlocutor.id : null}
            />
            {
                activeDialog &&
                    <ChatContent
                        dialog={activeDialog}
                        user={user}
                    />
            }
        </div>
    );
};

export default Main;