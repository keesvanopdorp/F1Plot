import BaseRequest from "./baseRequest";
import Season from "./season";

export default interface SeasonsRequest extends BaseRequest {
    MRData: BaseRequest['MRData'] & {
        SeasonTable: {
            Seasons: Season[]
        }
    }
}