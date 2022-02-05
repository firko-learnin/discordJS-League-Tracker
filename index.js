// Import the necessary discord.js classes
import { Client, Intents } from "discord.js";

// Import PG queries
import addGame from "./db/queries/addGame.js";
import checkGameExists from "./db/queries/checkGameExists.js";
import updateWL from "./db/queries/updateWL.js";

//Import functions
import getID from "./api/getID.js";
import getLiveGame from "./api/getLiveGame.js";
import printStats from "./botCommands/printStats.js";
import fetchMatchByMatchID from "./api/fetchMatchByMatchID.js";

// Declare const variables
const TOKEN = process.env.TOKEN;
const USERNAME = process.env.USERNAME;
let inGame = false;
let channel = undefined;
let CACHE = {
  username: USERNAME,
  id: undefined,
  lastGameID: undefined,
};

// Create a new client instance
const client = new Client({ intents: [Intents.FLAGS.GUILDS] });

// When the client is ready, run this code (only once)
client.once("ready", () => {
  console.log("Ready!");
});

// Login to Discord with your client's token
client.login(TOKEN);

//Find the relevant channel
client.once("ready", function getChannel() {
  const data = client.channels.cache.get("939514944276295720");
  channel = data;
  return data;
});

// Get key if not exists
async function populateID() {
  if (CACHE.id === undefined) {
    const newCACHE = await getID();
    CACHE = { ...CACHE, ...newCACHE };
    console.log("Played id found and saved!");
  } else {
    return;
  }
}

setInterval(populateID, 5000);

async function checkIfInGame() {
  //If encrypted id has not yet been located stop this function
  if (CACHE.id === undefined) return;
  //Check if player is in a game only if status is not in a game
  if (inGame === false) {
    const liveStats = await getLiveGame(CACHE.id);
    if (liveStats.status) {
      inGame = false;
      return null;
    } else {
      //If not in table set inGame to true
      inGame = true;
      //Store game ID in "cache"
      CACHE = { ...CACHE, gameID: liveStats.gameId };
      //Check if the games ID is already in the pg tableLayout
      const check = await checkGameExists(CACHE.gameID);
      // If data is not in table length is 0
      if (check.length === 0) {
        //Post game ID to table for future loops
        addGame(CACHE.username, CACHE.gameID);
        //Post message in Discord
        printStats(liveStats, channel);
      }
      return null;
    }
  }
}

//Run above function every 15 seconds
setInterval(checkIfInGame, 16000);

async function endGame() {
  if (inGame === false) return;
  const checkGameEnded = await getLiveGame(CACHE.id);
  // If the game is over status is 404 - truthy
  if (checkGameEnded.status) {
    console.log("Game ended");
    inGame = false;
    let last = CACHE.gameID;
    CACHE = { ...CACHE, gameID: undefined, lastGameID: last };
  } else {
    console.log("Game still going");
    return null;
  }
}

setInterval(endGame, 5000);

async function getLastGameStats() {
  if (CACHE.lastGameID === undefined) {
    return;
  } else {
    //Determine whether game was a win or loss using matches API
    const matchData = await fetchMatchByMatchID(CACHE.gameID);
    if (matchData === undefined) {
      return;
    } else {
      // Find the index of the participant
      const index = await matchData.participants.findIndex(
        (participant) => participant.summonerName === CACHE.username
      );
      console.log({ index });
      // Determine whether that participant won
      let result = "";
      if (matchData.participants[index].win === true) {
        result = "W";
      } else {
        result = "L";
      }
      // Update table with W/L
      updateWL(CACHE.username, CACHE.gameID, result);
      // Determine KDA
      let KDA =
        (matchData.participants[index].kills +
          matchData.participants[index].assists) /
        matchData.participants[index].deaths;
      KDA = Math.round(KDA * 100) / 100;
      channel.send(
        `Game ended, it's a ${result}! \nKills: ${matchData.participants[index].kills} \nDeaths: ${matchData.participants[index].deaths} \nAssists: /${matchData.participants[index].assists} \nKDA:${KDA}`
      );
      CACHE = { ...CACHE, lastGameID: undefined };
    }
  }
}

setInterval(endGame, 30000);
