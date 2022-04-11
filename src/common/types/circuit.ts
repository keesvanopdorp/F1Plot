import Location from "./location";

export default interface Circuit {
    circuitId:   string;
    url:         string;
    circuitName: string;
    Location:    Location;
}