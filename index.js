// Import the necessary discord.js classes
import { Client, Intents } from "discord.js";

//Import functions
import getID from "./api/getID.js";
import getLiveGame from "./api/getLiveGame.js";
import printStats from "./botCommands/printStats.js";

//Import dummy data
import { LIVESTATS } from "./data.js";

// Declare const variables
const TOKEN = process.env.TOKEN;
const USERNAME = process.env.USERNAME;
let inGame = false;
let liveGameID = "";
let channel = undefined;
let CACHE = {
  username: USERNAME,
  id: undefined,
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
  } else {
    return;
  }
}

setInterval(populateID, 5000);

async function checkIfInGame() {
  //If encrypted id has not yet been located end
  if (CACHE.id === undefined) return;
  //If not already in a game check if in a game
  if (inGame === false) {
    const liveStats = await getLiveGame(CACHE.id);
    console.log("Check if ingame result:");
    console.log(liveStats);
    if (liveStats.status) {
      return null;
    } else {
      inGame = true;
      printStats(liveStats, channel);
      setInterval(async function () {
        const checkGameEnded = await getLiveGame(CACHE.id);
        if (liveStats.status) {
          channel.send("Game ended");
          inGame = false;
        } else {
          console.log("Game still going");
          return null;
        }
      }, 5000);
    }
  }
}

setInterval(checkIfInGame, 15000);
