import React, {FC, useMemo} from "react";
import UserCard from "../../components/UserCard/UserCard.tsx";
import {IUserDto} from "../../models/IStore/IAuthentication.ts";

interface IUsersProps {
    users: IUserDto[];
    onClickUser: (user: IUserDto) => void;
}

const Users: FC<IUsersProps> = ({users, onClickUser}) => {

    const list = useMemo(() => {
        return users.map(user =>
            <UserCard
                key={user.id}
                user={user}
                onClick={() => onClickUser(user)}
            />
        );
    }, [users, onClickUser]);

    return (
        <ul className="users__list">
            {list}
        </ul>
    );
};

export default Users;