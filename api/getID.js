const APIKEY = process.env.APIKEY;
import fetch from "node-fetch";

export default async function getID(user) {
  const data = async function () {
    const request = await fetch(
      `https://euw1.api.riotgames.com/lol/summoner/v4/summoners/by-name/${user.username}`,
      {
        method: "GET",
        headers: {
          Origin: "https://developer.riotgames.com",
          "X-Riot-Token": APIKEY,
        },
      }
    );
    const response = await request.json();
    const newCache = {
      username: user.username,
      id: response.id,
    };
    return newCache;
  };
  const result = await data();
  // res.status(200).json(result);
  //Returns Summoner's encrypted ID (not PUUID)
  return result;
}
