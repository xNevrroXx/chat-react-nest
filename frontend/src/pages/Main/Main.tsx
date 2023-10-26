import {Fragment, useCallback, useEffect, useState} from "react";
import {Modal} from "antd";
import {useNavigate} from "react-router-dom";
// own modules
import {ROUTES} from "../../router/routes.ts";
import {useAppDispatch, useAppSelector} from "../../hooks/store.hook.ts";
import {createRoute} from "../../router/createRoute.ts";
import Rooms from "../../modules/Rooms/Rooms.tsx";
import Dialogs from "../../modules/Dialogs/Dialogs.tsx";
import ActiveRoom from "../../modules/ActiveRoom/ActiveRoom.tsx";
// selectors & actions
import {forwardMessageSocket} from "../../store/thunks/chat.ts";
// own types
import type {IRoom, TForwardMessage} from "../../models/IStore/IChats.ts";
import type {TValueOf} from "../../models/TUtils.ts";
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

    useEffect(() => {
        if (!user) {
            navigate(createRoute({path: ROUTES.AUTH}));
        }
    }, [user, navigate]);

    useEffect(() => {
        // set the first found chat as an active one
        if (rooms.length === 0) {
            return;
        }

        setActiveRoom(rooms[0]);
    }, [rooms]);

    const onChangeDialog = (roomId: TValueOf<Pick<IRoom, "id">>) => {
        const targetRoom = rooms.find(room => room.id === roomId)!;
        setActiveRoom(targetRoom);
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
    const openUsersListForForwardMessage = useCallback((forwardedMessageId: TValueOf<Pick<TForwardMessage, "forwardedMessageId">>) => {
        setForwardedMessageId(forwardedMessageId);
        setIsOpenModalForForwardMessage(true);
    }, []);

    const onCloseForwardModal = () => {
        setIsOpenModalForForwardMessage(false);
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
                    <ActiveRoom
                        room={activeRoom}
                        user={user}
                        onOpenUsersListForForwardMessage={openUsersListForForwardMessage}
                    />
                }
            </div>
            <Modal
                title="Переслать сообщение"
                open={isOpenModalForForwardMessage}
                onCancel={onCloseForwardModal}
                okButtonProps={{ style: {display: "none"} }}
                cancelButtonProps={{ style: {display: "none"} }}
            >
                <Rooms rooms={rooms} onClickRoom={onClickRoom}/>
            </Modal>
        </Fragment>
    );
};

export default Main;