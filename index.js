// Import server for replit
import keepAlive from "./server.js";

// Import the necessary discord.js classes
import { Client, Intents } from "discord.js";

// Import PG queries
import addGame from "./db/queries/addGame.js";
import checkGameExists from "./db/queries/checkGameExists.js";
import updateWL from "./db/queries/updateWL.js";
import unresolvedGames from "./db/scripts/unresolvedGames.js";

//Import functions
import getID from "./api/getID.js";
import getLiveGame from "./api/getLiveGame.js";
import printStats from "./botCommands/printStats.js";
import fetchMatchByMatchID from "./api/fetchMatchByMatchID.js";

// Declare const variables
const TOKEN = process.env.TOKEN;
const USERS = [
  "Ron Swanson",
  "FionnODO",
  "Wesleý",
  "Oscrob",
  "Santeniett",
  "Stableyd",
  "RhythmiCon",
];
// let inGame = false;
let channels = undefined;
let CACHE = USERS.map((user) => ({
  username: user,
  id: undefined,
  lastGameID: undefined,
  inGame: false,
}));

// Create a new client instance
const client = new Client({ intents: [Intents.FLAGS.GUILDS] });

// When the client is ready, run this code (only once)
client.once("ready", () => {
  console.log("Ready!");
});

// Listen for commands

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isCommand()) return;

  const { commandName } = interaction;

  if (commandName === "ping") {
    await interaction.reply("Pong!");
  } else if (commandName === "server") {
    await interaction.reply("Server info.");
  } else if (commandName === "user") {
    await interaction.reply("User info.");
  }
});

// Call keep alive function to host on replit
keepAlive();

// Login to Discord with your client's token
client.login(TOKEN);

//Find the relevant channel
client.once("ready", function getChannel() {
  const data = [
    client.channels.cache.get("939296773934030900"),
    client.channels.cache.get("939514944276295720"),
  ];
  channels = data;
  return data;
});

// Get key if not exists
async function populateID() {
  CACHE.forEach(async function (user, index) {
    if (user.id === undefined) {
      const newCACHE = await getID(user);
      CACHE[index] = { ...CACHE[index], ...newCACHE };
      console.log(`Played id found and saved for ${user.username}!`);
      console.log(CACHE[index]);
      return;
    } else {
      return;
    }
  });
}

populateID();

async function checkIfInGame() {
  console.log("Checking if players are in a game...");
  CACHE.forEach(async function (user, index) {
    //If encrypted id has not yet been located stop this function
    if (user.id === undefined) return;
    //Check if player is in a game only if status is not in a game
    if (user.inGame === false) {
      const liveStats = await getLiveGame(user.id);
      //Logic if no live game returned
      if (liveStats.status) {
        return null;
      } else {
        //Prevent custom games from being added to PG table as they never get win/loss stats
        if (liveStats.gameType === "CUSTOM_GAME") {
          return null;
        } else {
          //Logic if user is in a game
          //Set inGame to true
          CACHE[index] = { ...CACHE[index], inGame: true };
          //Store game ID in "cache"
          CACHE[index] = { ...CACHE[index], gameID: liveStats.gameId };
          //Check if the game ID is already in the pg tableLayout
          const check = await checkGameExists(liveStats.gameId);
          // If data is not in table length is 0
          if (check.length === 0) {
            //Post game ID to table
            addGame(user.username, CACHE[index].gameID);
            //Post message in Discord
            printStats(user.username, liveStats, channels);
          }
          return null;
        }
      }
    }
  });
}

//Run above function every 16 seconds
setInterval(checkIfInGame, 16000);

async function endGame() {
  USERS.forEach(async function (user, index) {
    if (user.inGame === false || user.id === undefined) {
      return;
    } else {
      const checkGameEnded = await getLiveGame(user.id);
      // If the game is over status is 404 - truthy
      if (checkGameEnded.status) {
        console.log(
          `${user.username}'s game has ended, game ID was ${user.gameID}, updating last game ID`
        );
        if (user.gameId !== undefined) {
          let last = user.gameID;
          CACHE[index] = {
            ...CACHE[index],
            gameID: undefined,
            lastGameID: last,
          };
          console.log(`Set ${user.username}'s last game ID`);
        }
        CACHE[index] = { ...CACHE[index], inGame: false };
      } else {
        return null;
      }
    }
  });
}

setInterval(endGame, 12000);

//Rewrite last game stats using all empty entries in PG table

async function getLastGameStats() {
  const games = await unresolvedGames();
  games.forEach(async function (game) {
    //Check if unresolved game matches any games in progress and break look if true
    if (CACHE.some((user) => user.gameID === game.gameid)) {
      console.log(
        `${game.gameid} is still in progress, stopping stats lookup.`
      );
    } else {
      const matchData = await fetchMatchByMatchID(game.gameid);
      if (matchData === undefined) {
        console.log(
          `Last game stats for ${game.username} not yet found on Riot API, game ID ${game.gameid}`
        );
        return;
      } else {
        console.log(
          `Found last game stats for ${game.username}'s last game! Game ID ${game.gameid}`
        );
        // Find the index of the participant
        const index = await matchData.participants.findIndex(
          (participant) => participant.summonerName === game.username
        );
        // Determine whether that participant won
        let result = "";
        if (matchData.participants[index].win === true) {
          result = "W";
        } else {
          result = "L";
        }
        // Update table with W/L
        updateWL(game.username, game.gameid, result);
        // Determine KDA
        let KDA =
          (matchData.participants[index].kills +
            matchData.participants[index].assists) /
          matchData.participants[index].deaths;
        KDA = Math.round(KDA * 100) / 100;
        let duration = matchData.gameDuration / 60 + " minutes";
        if (duration > 3000) {
          duration += " OOF it's a 50 minute banger!";
        }
        channels.forEach((channel) =>
          channel.send(
            `${game.username}'s game ended, it's a ${result}! \nKills: ${matchData.participants[index].kills} \nDeaths: ${matchData.participants[index].deaths} \nAssists: ${matchData.participants[index].assists} \nKDA:${KDA} \nDuration: ${duration}`
          )
        );
      }
    }
  });
}

setInterval(getLastGameStats, 30000);
