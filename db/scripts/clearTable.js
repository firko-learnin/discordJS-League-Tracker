import query from "../connection.js";

const tableQuery = `TRUNCATE games`;

async function clearTable() {
  const data = await query(tableQuery);
  console.log(data.rows);
}
clearTable();
export default clearTable;
