import mariadb from "mariadb";
import { config } from "../config.js";

const pool = mariadb.createPool({
  host: config.db.host,
  user: config.db.user,
  database: config.db.database,
  password: config.db.password,
  port: config.db.port,
});

export const db = await pool.getConnection();
