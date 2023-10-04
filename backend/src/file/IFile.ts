import {File} from "@prisma/client";

type TFileToClient = Omit<File, "filename"> & {buffer: ArrayBuffer};

export {TFileToClient};