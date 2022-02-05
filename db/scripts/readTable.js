import query from "../connection.js";

const tableQuery = `SELECT * from games`;

async function readTable() {
  const data = await query(tableQuery);
  console.log(data.rows);
}
readTable();
export default readTable;
