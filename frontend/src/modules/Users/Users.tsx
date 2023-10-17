import React, {FC, useMemo} from "react";
import {IUserDto} from "../../models/IStore/IAuthentication.ts";
import UserCard from "../../components/UserCard/UserCard.tsx";

interface IUsersProps {
    users: IUserDto[];
    onClick: (user: IUserDto) => void;
}

const Users: FC<IUsersProps> = ({users, onClick}) => {

    const list = useMemo(() => {
        return users.map(user =>
            <UserCard
                key={user.id}
                id={user.id}
                dialogName={user.name}
                onClick={() => onClick(user)}
            />
        );
    }, [users, onClick]);

    return (
        <ul className="users__list">
            {list}
        </ul>
    );
};

export default Users;