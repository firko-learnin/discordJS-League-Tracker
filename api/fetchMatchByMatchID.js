const APIKEY = process.env.APIKEY;
import fetch from "node-fetch";

export default async function fetchMatchByMatchID(id) {
  id = `EUW1_` + id;
  const data = async function () {
    const request = await fetch(
      `https://europe.api.riotgames.com/lol/match/v5/matches/${id}`,
      {
        method: "GET",
        headers: {
          Origin: "https://developer.riotgames.com",
          "X-Riot-Token": APIKEY,
        },
      }
    );
    const response = await request.json();
    return response;
  };
  const result = await data();
  return result.info;
}
