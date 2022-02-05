import pg from "pg";
import * as config from "../config.js";

const pool = new pg.Pool({
  user: config.dbUser,
  host: config.dbHost,
  database: config.dbName,
  password: config.dbPass,
  port: config.dbPort,
  ssl: { rejectUnauthorized: false },
});

function query(text, params) {
  return pool.query(text, params);
}

export default query;
