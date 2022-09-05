import BaseRequest from "./baseRequest";
import Circuit from "./circuit";

export default interface LapsRequest extends BaseRequest {
  MRData: BaseRequest["MRData"] & {
    RaceTable: {
      season: string;
      round: string;
      Races: Race[];
    };
  };
}

interface Race {
  season: string;
  round: string;
  url: string;
  raceName: string;
  Circuit: Circuit;
  date: string;
  time: string;
  Laps: Lap[];
}

export interface Lap {
  number: string;
  Timings: Timing[];
}

export interface Timing {
  driverId: string;
  position: string;
  time: string;
}
