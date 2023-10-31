import * as fs from "fs";
import {Injectable} from "@nestjs/common";
import {DatabaseService} from "../database/database.service";
import {AppConstantsService} from "../app.constants.service";
import {type File, Prisma} from "@prisma/client";
import HttpError from "../exceptions/http-error";
import * as path from "path";
import {TFileToClient} from "./IFile";
import {excludeSensitiveFields} from "../utils/excludeSensitiveFields";

@Injectable()
export class FileService {
    constructor(
        private prisma: DatabaseService,
        private constants: AppConstantsService
    ) {
        if (!fs.existsSync(this.constants.USERS_DATA_FOLDER_PATH)) {
            fs.mkdirSync(this.constants.USERS_DATA_FOLDER_PATH);
        }
    }

    async findOnDisk(filename: string): Promise<ArrayBuffer> {
        const pathToFile = path.join(this.constants.USERS_DATA_FOLDER_PATH, filename);

        return new Promise<ArrayBuffer>((resolve, reject) => {
            fs.readFile(pathToFile, (error, buffer) => {
                if (error) {
                    reject(error);
                }

                resolve(buffer);
            });
        });
    }

    async write(arrayBuffer: ArrayBuffer, filename: string): Promise<void> {
        const buffer = Buffer.from(arrayBuffer);
        const pathToFile = path.join(this.constants.USERS_DATA_FOLDER_PATH, filename);
        fs.writeFile(pathToFile, buffer, (error) => {
            if (error) {
                throw HttpError.InternalServerError();
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

    async addBlobToFiles(filesWithoutBlob: File[]): Promise<TFileToClient[]> {
        const filePromises: Promise<TFileToClient>[] = filesWithoutBlob.map(file => {
            const f: TFileToClient = excludeSensitiveFields(file, ["fileName"]) as TFileToClient;
            return this.findOnDisk(file.fileName)
                .then((buffer) => {
                    f.buffer = buffer;
                    return f;
                });
        });

        return Promise.all(filePromises);
    }
}
