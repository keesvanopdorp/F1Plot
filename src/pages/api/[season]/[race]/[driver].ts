import { client, connect, close } from "@redis";
import { LapsRequest } from "@types";
import Axios, { AxiosResponse } from "axios";
import { NextApiRequest, NextApiResponse } from "next"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    await connect();
    console.log(`client is open: ${client.isOpen}`);
    
    const { race, season, driver } = req.query;
    const redisKey = `seasons:${season}:${race}:${driver}`;
    const laptimesFromRedis = await client.json.get(redisKey)
    let laptimes: { [key: string]: string[] } = {}
    if (!laptimesFromRedis) {
        const url = `	https://ergast.com/api/f1/${season}/${race}/${driver !== 'all' ? `drivers/${driver}/` : ''}laps.json?limit=1000000`
        console.log(`url: ${url}`);
        const res: AxiosResponse<LapsRequest> = await Axios.get(url)
        if (driver !== 'all') {
            const key = driver as string;
            console.log('you have chosen a driver with the key: ' + key);
            for (let lap of res.data.MRData.RaceTable.Races[0].Laps) {
                const timing = lap.Timings[0].time;
                laptimes = Object.keys(laptimes).includes(key) ? ({ ...laptimes, [key]: [...laptimes[key], timing] }) : Object.assign(laptimes, { [key]: [timing] })
            }
        } else {
            for (let lap of res.data.MRData.RaceTable.Races[0].Laps) {
                for (let currentTiming of lap.Timings) {
                    const timing = currentTiming.time;
                    const key = currentTiming.driverId;
                    laptimes = Object.keys(laptimes).includes(key) ? ({ ...laptimes, [key]: [...laptimes[key], timing] }) : Object.assign(laptimes, { [key]: [timing] })
                }
            }
        }
        await client.json.set(redisKey, ".", JSON.parse(JSON.stringify(laptimes)));
    } else {
        laptimes = JSON.parse(JSON.stringify(laptimesFromRedis));
    } 
    res.status(200).json(laptimes);
}