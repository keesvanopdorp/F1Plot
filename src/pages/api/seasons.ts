import { client, close, connect } from "@redis";
import { Season, SeasonsRequest } from "@types";
import axios, { AxiosResponse } from "axios";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  await connect();
  const key = `seasons`;
  let seasons: Season[] = [];
  const seasonsFromRedis = await client.json.get(key);
  if (!seasonsFromRedis) {
    const res: AxiosResponse<SeasonsRequest> = await axios.get(
      "https://ergast.com/api/f1/seasons.json?limit=1000&offset=50"
    );
    seasons = res.data.MRData.SeasonTable.Seasons;
    await client.json.set(key, ".", JSON.parse(JSON.stringify(seasons)));
  } else {
    seasons = JSON.parse(JSON.stringify(seasonsFromRedis));
  }
  return res.status(200).json(seasons);
}
