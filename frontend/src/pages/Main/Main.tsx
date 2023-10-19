import {Fragment, useEffect, useState} from "react";
import {Modal} from "antd";
import {useNavigate} from "react-router-dom";
// own modules
import {ROUTES} from "../../router/routes.ts";
import {useAppDispatch, useAppSelector} from "../../hooks/store.hook.ts";
import {createRoute} from "../../router/createRoute.ts";
import Rooms from "../../modules/Users/Users.tsx";
import Dialogs from "../../modules/Dialogs/Dialogs.tsx";
import ChatContent from "../../modules/ChatContent/ChatContent.tsx";
// selectors & actions
import {forwardMessageSocket} from "../../store/thunks/chat.ts";
// own types
import type {IRoom, TForwardMessage} from "../../models/IStore/IChats.ts";
import {TValueOf} from "../../models/TUtils.ts";
// styles
import "./main.scss";

const Main = () => {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const user = useAppSelector(state => state.authentication.user!);
    const rooms = useAppSelector(state => state.chat.chats);
    const [activeRoom, setActiveRoom] = useState<IRoom | null>(null);
    const [isOpenModalForForwardMessage, setIsOpenModalForForwardMessage] = useState<boolean>(false);
    const [forwardedMessageId, setForwardedMessageId] = useState<TValueOf<Pick<TForwardMessage, "forwardedMessageId">> | null>(null);

    console.log("userDialogs: ", rooms);
    useEffect(() => {
        if (!user) {
            navigate(createRoute({path: ROUTES.AUTH}));
        }
    }, [user, dispatch]);

    useEffect(() => {
        // set the first found chat as an active one
        if (rooms.length === 0) {
            return;
        }

        setActiveRoom(rooms[0]);
    }, [rooms]);

    const onChangeDialog = (dialog: IRoom) => {
        setActiveRoom(dialog);
    };

    const onClickRoom = (room: IRoom) => {
        setIsOpenModalForForwardMessage(false);
        if (!forwardedMessageId) {
            return;
        }

        void dispatch(
            forwardMessageSocket({
                roomId: room.id,
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
                    rooms={rooms}
                    onChangeDialog={onChangeDialog}
                    activeChatId={activeRoom ? activeRoom.id : null}
                />
                { activeRoom &&
                    <ChatContent
                        room={activeRoom}
                        user={user}
                        onOpenUsersListForForwardMessage={openUsersListForForwardMessage}
                    />
                }
            </div>
            <Modal
                open={isOpenModalForForwardMessage}
            >
                <Rooms rooms={rooms} onClickRoom={onClickRoom}/>
            </Modal>
        </Fragment>
    );
};

export default Main;