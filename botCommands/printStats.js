import fetch from "node-fetch";

const USERNAME = process.env.USERNAME;

//Get latest champion data
const champions = async () => {
  const req = await fetch(
    "https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/champion-summary.json"
  );
  const res = await req.json();
  return res;
};

//Find user in game
function findUser(liveStats) {
  const index = liveStats.participants.findIndex(
    (participant) => participant.summonerName === USERNAME
  );
  return index;
}

//Get champ data
async function findChamp(liveStats, index) {
  const allChamps = await champions();
  const champID = liveStats.participants[index].championId;
  const champIndex = allChamps.findIndex((champ) => champ.id === champID);
  const champData = allChamps[champIndex];
  const result = {
    champName: champData.name,
    champIcon: `https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/champion-icons/${champData.id}.png`,
  };
  return result;
}

//Message to send on Discord
export default async function printStats(liveStats, channels) {
  const index = findUser(liveStats);
  const champData = await findChamp(liveStats, index);
  const data = {
    intro: `${liveStats.participants[index].summonerName} has entered a game!`,
    gameMode: liveStats.gameMode,
    championName: champData.champName,
    championImage: champData.champIcon,
  };
  channels.forEach((channel) =>
    channel.send({
      content: `${data.intro} \nGame mode: ${data.gameMode} \nChampion: ${data.championName}`,
      files: [
        {
          attachment: data.championImage,
        },
      ],
    })
  );
  return data;
}
