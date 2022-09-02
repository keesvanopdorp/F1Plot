import Circuit from "./circuit";
import Session from "./session";

export default interface Race {
    season: string;
    round: string;
    url: string;
    raceName: string;
    Circuit: Circuit;
    date: string;
    time: string;
    FirstPractice: Session;
    SecondPractice: Session;
    ThirdPractice?: Session;
    Qualifying: Session;
    Sprint?: Session;
}