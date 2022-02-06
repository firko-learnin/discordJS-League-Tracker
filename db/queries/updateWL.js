import query from "../connection.js";

export default async function updateWL(username, gameid, WL) {
  console.log(username, gameid, WL);
  const data = await query(
    "UPDATE games SET winorloss = $3 WHERE gameid = $2 AND username = $1 RETURNING id, gameid, username",
    [username, gameid, WL]
  );
  console.log("done");
  console.log({ data });
}

export async function checkGameExists(gameid) {
  console.log("Game ID below:");
  console.log(gameid);
  const data = await query("SELECT * from games WHERE gameid = $1", [gameid]);
  return data.rows;
}
