import query from "../connection.js";

const tableQuery = `SELECT * from games WHERE winorloss IS NULL`;

async function unresolvedGames() {
  const data = await query(tableQuery);
  console.log(data.rows);
  return data.rows;
}
export default unresolvedGames;
