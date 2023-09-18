import {User} from "@prisma/client";

type keys = keyof User;

export function excludeSensitiveFields<User, Key extends keyof User>(
    user: User,
    keys: Key[]
): Omit<User, Key> {
    const result: User = {} as User;
    for (const key of Object.keys(user) as Key[]) {
        if (keys.includes(key)) {
            continue;
        }

        result[key] = user[key];
    }

    return result;
}