import query from "../connection.js";

export default async function checkGameExists(gameid) {
  console.log("Game ID below:");
  console.log(gameid);
  const data = await query("SELECT * from games WHERE gameid = $1", [gameid]);
  return data.rows;
}
