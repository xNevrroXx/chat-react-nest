import {Fragment, useCallback, useEffect, useState} from "react";
import {Layout, Modal} from "antd";
import {useNavigate} from "react-router-dom";
// own modules
import {ROUTES} from "../../router/routes.ts";
import {useAppDispatch, useAppSelector} from "../../hooks/store.hook.ts";
import {createRoute} from "../../router/createRoute.ts";
import ListRooms from "../../modules/ListRooms/ListRooms.tsx";
import ActiveRoom from "../../modules/ActiveRoom/ActiveRoom.tsx";
import Dialogs from "../../modules/Dialogs/Dialogs.tsx";
// selectors & actions
import {createRoom, forwardMessageSocket} from "../../store/thunks/room.ts";
// own types
import type {IForwardMessage, IRoom, TTemporarilyRoomBySearch} from "../../models/IStore/IRoom.ts";
import type {TValueOf} from "../../models/TUtils.ts";
// styles
import "./main.scss";

const {Content} = Layout;

const Main = () => {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const user = useAppSelector(state => state.authentication.user!);
    const rooms = useAppSelector(state => state.room.rooms);
    const [activeRoom, setActiveRoom] = useState<IRoom | null>(null);
    const [isOpenModalForForwardMessage, setIsOpenModalForForwardMessage] = useState<boolean>(false);
    const [forwardedMessageId, setForwardedMessageId] = useState<TValueOf<Pick<IForwardMessage, "forwardedMessageId">> | null>(null);

    useEffect(() => {
        if (!user) {
            navigate(createRoute({path: ROUTES.AUTH}));
        }
    }, [user, navigate]);

    useEffect(() => {
        // set the first found chat as an active one
        const currentModifiedRoom = activeRoom && rooms.find(room => room.id === activeRoom.id);
        if (currentModifiedRoom) {
            setActiveRoom(currentModifiedRoom);
            return;
        }

        setActiveRoom(rooms[0] || null);
    }, [rooms, activeRoom]);

    const onChangeDialog = useCallback((roomId: TValueOf<Pick<IRoom, "id">>) => {
        const targetRoom = rooms.find(room => room.id === roomId)!;
        setActiveRoom(targetRoom);
    }, [rooms]);

    const onCreateNewDialog = useCallback((remoteRoom: TTemporarilyRoomBySearch) => {
        void dispatch(createRoom(remoteRoom));
    }, [dispatch]);

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
    const openUsersListForForwardMessage = useCallback((forwardedMessageId: TValueOf<Pick<IForwardMessage, "forwardedMessageId">>) => {
        setForwardedMessageId(forwardedMessageId);
        setIsOpenModalForForwardMessage(true);
    }, []);

    const onCloseForwardModal = () => {
        setIsOpenModalForForwardMessage(false);
    };

    return (
        <Fragment>
            <Content className="messenger">
                <Dialogs
                    user={user}
                    rooms={rooms}
                    onChangeDialog={onChangeDialog}
                    onCreateNewDialog={onCreateNewDialog}
                    activeRoomId={activeRoom ? activeRoom.id : null}
                />
                <ActiveRoom
                    room={activeRoom}
                    user={user}
                    onOpenUsersListForForwardMessage={openUsersListForForwardMessage}
                />
            </Content>
            <Modal
                title="Переслать сообщение"
                open={isOpenModalForForwardMessage}
                onCancel={onCloseForwardModal}
                okButtonProps={{ style: {display: "none"} }}
                cancelButtonProps={{ style: {display: "none"} }}
            >
                <ListRooms rooms={rooms} onClickRoom={onClickRoom}/>
            </Modal>
        </Fragment>
    );
};

export default Main;