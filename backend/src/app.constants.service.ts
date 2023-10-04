import {Injectable} from "@nestjs/common";
import * as path from "path";


@Injectable()
export class AppConstantsService {
    readonly DIRNAME = __dirname;
    readonly USERS_DATA_FOLDER_PATH = path.resolve(__dirname, "users-data");
}