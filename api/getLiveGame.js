const APIKEY = process.env.APIKEY;
import fetch from "node-fetch";

export default async function getLiveGame(id) {
  const data = async function () {
    const request = await fetch(
      `https://euw1.api.riotgames.com/lol/spectator/v4/active-games/by-summoner/${id}`,
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
  //Returns live game data
  return result;
}
