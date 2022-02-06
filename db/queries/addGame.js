import query from "../connection.js";

export default async function addGame(username, gameid) {
  console.log("Inside addgame function");
  console.log(username, gameid);
  const data = await query(
    "INSERT INTO games (username, gameid) VALUES ($1, $2) ON CONFLICT DO NOTHING RETURNING *",
    [username, gameid]
  );
}
