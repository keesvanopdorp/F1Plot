import { client, close, connect } from "@redis";
import { Race, RacesRequest } from "@types";
import Axios, { AxiosResponse } from "axios";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    await connect()
    const { season } = req.query;
    const key = `seasons:${season}:races`;
    let races: Race[] = [];
    const racesFromRedis = await client.json.get(key);
    if (!racesFromRedis) {
        // drivers for that races dont exist in redis
        const url = `https://ergast.com/api/f1/${season}.json?limit=100`
        const res: AxiosResponse<RacesRequest> = await Axios.get(url)
        const data = res.data.MRData.RaceTable.Races;
        await client.json.set(key, ".", JSON.parse(JSON.stringify(data)))
        const d = new Date();
        await client.EXPIREAT(key, d.setDate(60))
        races = data;
    } else {
        console.log(racesFromRedis);
        races = JSON.parse(JSON.stringify(racesFromRedis))
    }
    return res.status(200).json(races);
}