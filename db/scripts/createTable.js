import query from "../connection.js";

const table = `CREATE TABLE IF NOT EXISTS games( id serial PRIMARY KEY, username VARCHAR ( 50 ), gameID VARCHAR (100) UNIQUE, winorloss VARCHAR (1));`;

async function createTable() {
  const newTable = await query(table);
}
createTable();
export default createTable;
