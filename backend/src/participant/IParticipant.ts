import {Participant} from "@prisma/client";

export type TNormalizedParticipant =
    Participant &
    {
        isOnline: boolean,
        isTyping: boolean,
        nickname: string
    }