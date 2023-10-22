import {Injectable} from "@nestjs/common";
import {Prisma} from "@prisma/client";

@Injectable()
export class ParticipantService {
    normalize(
        participant: Prisma.ParticipantGetPayload<{
            include: {
                    user: {
                        include: {
                            userOnline: true,
                            userTyping: true
                        }
                    }
                }
            }>
    ) {
        const userNickname = participant.user.name + " " + participant.user.surname;
        const isOnline = participant.user.userOnline ? participant.user.userOnline.isOnline : false;
        const isTyping = participant.user.userTyping ? participant.user.userTyping.isTyping : false;
        const participantInfo = {
            ...participant,
            isOnline: isOnline,
            isTyping: isTyping,
            nickname: userNickname
        };
        delete participantInfo.user;

        return participantInfo;
    }
}
