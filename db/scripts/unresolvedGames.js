import query from "../connection.js";

const tableQuery = `SELECT * from games WHERE winorloss IS NULL`;

export default async function unresolvedGames() {
  const data = await query(tableQuery);
  return data.rows;
}
