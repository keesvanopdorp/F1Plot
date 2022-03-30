import BaseRequest from "./baseRequest";
import Race from "./race";

export default interface RacesRequest extends BaseRequest {
    MRData: BaseRequest['MRData'] & {
        RaceTable: {
            season: string;
            Races: Race[]
        }
    }
}