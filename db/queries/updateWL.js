import query from "../connection.js";

export default async function updateWL(username, gameid, WL) {
  const data = await query(
    "UPDATE games SET winorloss = '$3' WHERE username = '$2' gameid = '$2' RETURNING *",
    [username, gameid, WL]
  );
}
