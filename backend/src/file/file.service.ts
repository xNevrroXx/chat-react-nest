import * as fs from "fs";
import {Injectable} from "@nestjs/common";
import {DatabaseService} from "../database/database.service";
import {AppConstantsService} from "../app.constants.service";
import {type File, Prisma} from "@prisma/client";
import ApiError from "../exceptions/api-error";

@Injectable()
export class FileService {
    constructor(
        private prisma: DatabaseService,
        private constants: AppConstantsService
    ) {
        if (!fs.existsSync(this.constants.USERS_DATA_FOLDER_PATH)) {
            console.log("Doesn't");
            fs.mkdirSync(this.constants.USERS_DATA_FOLDER_PATH);
        }
    }

    async writeFile(arrayBuffer: ArrayBuffer, filename: string): Promise<void> {
        console.log("Buffer: ", arrayBuffer);
        const buffer = Buffer.from(arrayBuffer);
        console.log("CONST: ", this.constants.USERS_DATA_FOLDER_PATH);
        fs.writeFile(this.constants.USERS_DATA_FOLDER_PATH + filename, buffer, (error) => {
            if (error) {
                throw ApiError.InternalServerError();
            }
        });
    }

    async findOne(
        fileWhereUniqueInput: Prisma.FileWhereUniqueInput
    ): Promise<File | null> {
        return this.prisma.file.findUnique({
            where: fileWhereUniqueInput
        });
    }

    async findMany(
        params: {
            skip?: number;
            take?: number;
            cursor?: Prisma.FileWhereUniqueInput;
            where?: Prisma.FileWhereInput;
            orderBy?: Prisma.FileOrderByWithRelationInput;
        }
    ): Promise<File[]> {
        const {skip, take, cursor, where, orderBy} = params;

        return this.prisma.file.findMany({
            skip,
            take,
            cursor,
            where,
            orderBy
        });
    }

    async delete(where: Prisma.FileWhereUniqueInput): Promise<File> {
        // todo delete from the disk
        return this.prisma.file.delete({
            where
        });
    }
}
