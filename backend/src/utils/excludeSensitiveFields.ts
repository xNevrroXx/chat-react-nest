import {Message, User} from "@prisma/client";

type keys = keyof User | keyof Message;

export function excludeSensitiveFields<Data, Key extends keyof Data>(
    user: Data,
    keys: Key[]
): Omit<Data, Key> {
    const result: Data = {} as Data;
    for (const key of Object.keys(user) as Key[]) {
        if (keys.includes(key)) {
            continue;
        }

        result[key] = user[key];
    }

    return result;
}