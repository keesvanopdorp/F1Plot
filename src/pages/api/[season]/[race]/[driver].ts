import { client, connect } from "@redis";
import { LapsRequest } from "@types";
import axios, { AxiosResponse } from "axios";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  await connect();
  console.log(`client is open: ${client.isOpen}`);
  const { race, season, driver } = req.query;
  const redisKey = `seasons:${season}:${race}:${driver}`;
  const laptimesFromRedis = await client.json.get(redisKey);
  let laptimes: { [key: string]: { position: string; time: string }[] } = {};
  if (!laptimesFromRedis) {
    try {
      const driverSelection = driver !== "all" ? `drivers/${driver}/` : "";
      const url = `https://ergast.com/api/f1/${season}/${race}/${driverSelection}laps.json?limit=1000000`;
      const res: AxiosResponse<LapsRequest> = await axios.get(url);
      // This if is trigger if a graph of a spefic driver is selected
      if (driver !== "all") {
        const key = driver as string;
        for (let lap of res.data.MRData.RaceTable.Races[0].Laps) {
          const { driverId, ...timing } = lap.Timings[0];
          laptimes = Object.keys(laptimes).includes(key)
            ? { ...laptimes, [key]: [...laptimes[key], timing] }
            : Object.assign(laptimes, { [key]: [timing] });
        }
        // if the graph for all the drivers is selected than the else is triggerd
      } else {
        for (let lap of res.data.MRData.RaceTable.Races[0].Laps) {
          for (let currentTiming of lap.Timings) {
            const { driverId, ...timing } = currentTiming;
            laptimes = Object.keys(laptimes).includes(driverId)
              ? { ...laptimes, [driverId]: [...laptimes[driverId], timing] }
              : Object.assign(laptimes, { [driverId]: [timing] });
          }
        }
      }
      await client.json.set(
        redisKey,
        ".",
        JSON.parse(JSON.stringify(laptimes))
      );
    } catch (e) {
      return res
        .status(500)
        .json({ status: 500, message: (e as Error).message });
    }
  } else {
    laptimes = JSON.parse(JSON.stringify(laptimesFromRedis));
  }
  res.status(200).json(laptimes);
}
