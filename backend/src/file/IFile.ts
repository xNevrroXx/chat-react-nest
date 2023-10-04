import {File} from "@prisma/client";

type TFileToClient = Omit<File, "filename" | "messageId"> & {buffer: ArrayBuffer};

export {TFileToClient};