import BaseRequest from './baseRequest';
import Driver from './driver';

export default interface DriversRequest extends BaseRequest {
    MRData: BaseRequest['MRData'] & {
        DriverTable: {
            season: string;
            Drivers: Driver[]
        }
    }
}