import { client, close, connect } from "@redis";
import { Driver, DriversRequest } from "@types";
import Axios, { AxiosResponse } from "axios";
import { NextApiRequest, NextApiResponse } from "next";


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    await connect()
    const { season } = req.query;
    const key = `seasons:${season}:drivers`;
    let drivers: Driver[] = [];
    const driversFromRedis = await client.json.get(key);
    if (!driversFromRedis) {
        // drivers for that season dont exist in redis
        console.log('ik ga de drivers ophalen');
        const url = `https://ergast.com/api/f1/${season}/drivers.json?limit=100`
        const res: AxiosResponse<DriversRequest> = await Axios.get(url)
        const data = res.data.MRData.DriverTable.Drivers;
        await client.json.set(key, ".", JSON.parse(JSON.stringify(data)));
        drivers = data;
    } else {
        // Drivers for that season do exist in redis
        // console.log(driversFromRedis);
        drivers = JSON.parse(JSON.stringify(driversFromRedis));
    }
    return res.status(200).json(drivers);
}